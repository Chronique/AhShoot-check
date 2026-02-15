import { GoogleGenAI, Type } from "@google/genai";
import { SchemaDefinition } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTutorial = async (schema: SchemaDefinition, chainName: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: No API Key provided. Please configure your API key to view the tutorial.";

  try {
    const prompt = `
      You are an expert Web3 guide. Create a concise, step-by-step tutorial on how to get the "${schema.name}" attestation (Schema UID: ${schema.uid}) on the ${chainName} blockchain.
      
      The provider is ${schema.provider}.
      
      Structure the response in Markdown:
      1. **Prerequisites**: What user needs (wallet, funds).
      2. **Step-by-Step Guide**: How to verify.
      3. **Cost**: Estimated gas or fees.
      4. **Why it's useful**: Benefits of this attestation.
      
      Keep it practical and under 300 words.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Failed to generate tutorial content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't generate the tutorial at this moment. Please try again later.";
  }
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
    if (!client) return null;

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
        return null;
      } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
      }
}