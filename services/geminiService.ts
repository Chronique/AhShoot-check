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
      You are a Senior Web3 Technical Writer. Create a comprehensive educational guide for the "${schema.name}" attestation.
      
      **Context:**
      - Provider: ${schema.provider}
      - Description: ${schema.description}
      - Tech Tags: ${schema.tags.join(', ')}
      - Chain: ${chainName}

      **Strict Content Requirements:**
      
      1. **Technology Deep Dive (How it Works)**: 
         - This is the most important section. Explain the UNDERLYING TECHNOLOGY.
         - If the provider is **Clique**: You MUST explain **TEE (Trusted Execution Environment)**. Explain how user data is encrypted, sent to a secure enclave (like Intel SGX), processed privately off-chain, and only the result is verified on-chain. Mention "Privacy-Preserving Compute".
         - If **ZK** (Holonym, World ID): Explain how Zero-Knowledge Proofs verify attributes without revealing raw data.
         - If **Gitcoin/Trusta**: Explain the scoring algorithms and Sybil defense models.
      
      2. **Prerequisites**:
         - Wallet requirements, estimated funds (gas), and specific accounts needed (e.g., Twitter, Discord, Coinbase account).

      3. **Step-by-Step Execution**:
         - Clear, numbered list of actions the user must take.

      4. **Value & Utility**:
         - Why is this specific schema valuable? (e.g., "Access to under-collateralized loans", "Airdrop eligibility", "Governance weight").

      **Format**: Markdown. Use bolding for key terms. Keep explanations accurate but accessible.
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
