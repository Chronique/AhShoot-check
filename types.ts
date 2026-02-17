
export type VMType = 'EVM' | 'SVM' | 'MoveVM';

export interface Chain {
  id: number | string;
  name: string;
  color: string;
  logoUrl: string;
  graphqlUrl?: string;
  vmType: VMType;
  group: string;
}

export type SchemaCategory = 'Identity' | 'Social' | 'Biometric' | 'DeFi' | 'Governance';

export interface SchemaDefinition {
  uid: string;
  name: string;
  description: string;
  provider: string; 
  logoUrl?: string;
  docsUrl: string;
  category: SchemaCategory;
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
  networkLogo?: string;
  schemaLogo?: string;
}

export interface SchemaRecord {
  uid: string;
  schema: string;
  creator: string;
  resolver: string;
  attestationCount: number;
  network: string;
}

export enum AppView {
  EXPLORER = 'EXPLORER',
  TUTORIALS = 'TUTORIALS',
}

export interface ChatMessage {
  role: 'system' | 'user' | 'agent';
  content: string;
  timestamp: number;
}
