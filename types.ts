
export type VMType = 'EVM' | 'SVM' | 'MoveVM';

export interface Chain {
  id: number | string;
  name: string;
  color: string; // Kept for border/fallback styling
  logoUrl: string; // New: URL to the official logo
  graphqlUrl?: string;
  vmType: VMType;
  group: string;
}

export interface SchemaDefinition {
  uid: string;
  name: string;
  description: string;
  provider: string; 
  logoUrl?: string; // New: Provider logo (e.g., Gitcoin logo)
  docsUrl: string; // New: Link to official documentation
  category: 'Identity' | 'DeFi' | 'Social' | 'Governance' | 'Biometric' | 'ZK';
  tags: string[];
}

export interface Attestation {
  uid: string;
  schemaUid: string;
  recipient: string;
  attester: string;
  time: number;
  data: string;
  schemaName?: string;
  provider?: string;
  network: string;
  networkColor: string;
  networkLogo?: string; // New: To display on the card
}

export interface TutorialRequest {
  topic: string;
  chain: string;
}

export interface AnalysisResult {
  score: number;
  persona: string;
  analysis: string;
  louvainCluster: string; 
  lightgbmConfidence: number; 
}

export interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
}

export enum AppView {
  EXPLORER = 'EXPLORER',
  TUTORIALS = 'TUTORIALS',
}