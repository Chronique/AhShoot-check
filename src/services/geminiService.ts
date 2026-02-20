
import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // console.warn("API Key not found."); 
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Robust check for rate limiting errors
const isQuotaError = (error: any): boolean => {
  if (!error) return false;
  // Check standard HTTP status
  if (error.status === 429) return true;
  
  // Check error body if it exists
  const errorBody = error.error || error;
  if (errorBody?.code === 429 || errorBody?.status === 'RESOURCE_EXHAUSTED') return true;

  // Check message string
  const msg = (error.message || JSON.stringify(error)).toLowerCase();
  return msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted');
};

export interface AnalysisResult {
  score: number;
  persona: string;
  analysis: string;
  identityCluster: string; // Renamed from louvainCluster
  confidenceScore: number; // Renamed from lightgbmConfidence
}

export const analyzeAttestationPortfolio = async (attestations: string[]): Promise<AnalysisResult | null> => {
    const client = getClient();
    
    if (!client) {
        // Return null instead of fake data so the UI can handle "No Analysis" gracefully
        return null;
    }

    try {
        const prompt = `
          Analyze the following on-chain attestations for a user address: ${attestations.join(', ')}.
          
          Perform a portfolio analysis based on the credibility of these schemas.
          
          Determine:
          1. A "Reputation Score" (0-100).
          2. A "Persona" (e.g. "Verified Human", "DeFi Power User", "Airdrop Farmer").
          3. A short 2-sentence behavioral analysis.
          4. An "Identity Cluster" label describing their user group (e.g., "Tier 1 Validated", "Loose Social Graph", "High Value Trader").
          5. A "Confidence Score" (0.0 to 1.0) representing your certainty based on the data provided.
        `;
    
        const response = await client.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                persona: { type: Type.STRING },
                analysis: { type: Type.STRING },
                identityCluster: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
              }
            }
          }
        });
        
        if (response.text) {
          return JSON.parse(response.text) as AnalysisResult;
        }
        return null;
      } catch (error) {
        if (isQuotaError(error)) {
            console.warn("Gemini Quota Exceeded (Analysis).");
        } else {
            console.error("Gemini Analysis Error:", error);
        }
        return null;
      }
}

export const generateAttestationGuide = async (schemaName: string, provider: string): Promise<string> => {
    const client = getClient();
    if (!client) return "API Key missing. Cannot generate guide.";

    try {
        const prompt = `
            Create a short, step-by-step guide on how to obtain the "${schemaName}" attestation from "${provider}".
            
            Format as markdown.
            Include:
            1. Prerequisites (wallet, funds, accounts).
            2. Where to go (URL or platform).
            3. Exact steps to verify/mint.
            4. Cost (if any).
            
            Keep it under 200 words. Be direct.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "Could not generate guide.";
    } catch (error) {
        console.error("Guide Generation Error:", error);
        return "Failed to generate guide. Please try again later.";
    }
};
