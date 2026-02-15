export type VMType = 'EVM' | 'SVM' | 'MoveVM';

export interface Chain {
  id: number | string;
  name: string;
  icon: string;
  color: string;
  graphqlUrl?: string;
  vmType: VMType;
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
