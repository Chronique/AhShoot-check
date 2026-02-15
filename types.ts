
export type VMType = 'EVM' | 'SVM' | 'MoveVM';

export interface Chain {
  id: number | string;
  name: string;
  // Icon removed for cleaner UI as requested
  color: string;
  graphqlUrl?: string;
  vmType: VMType;
  group: string; // New field for technical categorization (e.g. "Optimistic Rollup", "ZK Rollup")
}

export interface SchemaDefinition {
  uid: string;
  name: string;
  description: string;
  provider: string; // e.g., "Coinbase", "Gitcoin"
  category: 'Identity' | 'DeFi' | 'Social' | 'Governance' | 'Biometric' | 'ZK';
  tags: string[];
}

export interface Attestation {
  uid: string;
  schemaUid: string;
  recipient: string;
  attester: string;
  time: number;
  data: string; // Decoded data or raw
  schemaName?: string;
  provider?: string;
  network: string; // The specific chain name (e.g. "Base", "Arbitrum")
  networkColor: string;
}

export interface TutorialRequest {
  topic: string;
  chain: string;
}

export interface AnalysisResult {
  score: number;
  persona: string;
  analysis: string;
  louvainCluster: string; // e.g., "Core Community Node", "Sybil Cluster 4"
  lightgbmConfidence: number; // e.g., 0.98
}

export enum AppView {
  EXPLORER = 'EXPLORER',
  TUTORIALS = 'TUTORIALS',
}
