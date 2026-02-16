import { GoogleGenAI, Type } from "@google/genai";
import { SchemaDefinition } from '../types';
import { POPULAR_SCHEMAS } from '../constants';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. AI features will be disabled.");
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
  louvainCluster: string;
  lightgbmConfidence: number;
}

export const analyzeAttestationPortfolio = async (attestations: string[]): Promise<AnalysisResult | null> => {
    const client = getClient();
    
    // Fallback logic to ensure UI doesn't break when API is down/limited
    const generateFallback = (): AnalysisResult => {
        const count = attestations.length;
        // Simple logic to simulate a score based on number of attestations
        const score = Math.min(96, 45 + (count * 7));
        
        let persona = "Explorer";
        if (count > 2) persona = "Active Citizen";
        if (count > 5) persona = "Power User";
        if (count > 8) persona = "Identity Maxi";

        return {
            score,
            persona,
            analysis: `⚠️ AI Offline: Based on your ${count} credentials, you show ${count > 3 ? "strong" : "emerging"} on-chain activity. (Simulated Analysis due to high traffic)`,
            louvainCluster: "Cluster Pending",
            lightgbmConfidence: 0.85
        };
    };

    if (!client) return generateFallback();

    try {
        const prompt = `
          Analyze the following on-chain attestations for a user address: ${attestations.join(', ')}.
          
          Simulate a high-tech data science analysis using "Louvain Clustering" for community detection and "LightGBM" for classification, executed within a Clique TEE (Trusted Execution Environment) for privacy.
          
          Determine:
          1. A "Reputation Score" (0-100).
          2. A "Persona" (e.g. "Verified Human", "DeFi Whale", "Airdrop Hunter").
          3. A short 2-sentence analysis.
          4. A "Louvain Cluster Label" (e.g., "Tier 1 Validated Users", "Loose Social Graph", "Sybil Suspect Group").
          5. A "LightGBM Confidence" score (0.0 to 1.0) representing the model's certainty.
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
                louvainCluster: { type: Type.STRING },
                lightgbmConfidence: { type: Type.NUMBER },
              }
            }
          }
        });
        
        if (response.text) {
          return JSON.parse(response.text) as AnalysisResult;
        }
        return generateFallback();
      } catch (error) {
        if (isQuotaError(error)) {
            console.warn("Gemini Quota Exceeded (Analysis) - Using fallback simulation.");
        } else {
            console.warn("Gemini Analysis Error - Using fallback:", error);
        }
        return generateFallback();
      }
}