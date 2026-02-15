import { Chain, SchemaDefinition } from './types';

export const CHAINS: Chain[] = [
  // --- EVM (Solidity) ---
  { 
    id: 1, 
    name: 'Ethereum', 
    icon: '🔷', 
    color: 'blue-500', 
    graphqlUrl: 'https://easscan.org/graphql',
    vmType: 'EVM'
  },
  { 
    id: 8453, 
    name: 'Base', 
    icon: '🔵', 
    color: 'blue-600', 
    graphqlUrl: 'https://base.easscan.org/graphql',
    vmType: 'EVM'
  },
  { 
    id: 10, 
    name: 'Optimism', 
    icon: '🔴', 
    color: 'red-500', 
    graphqlUrl: 'https://optimism.easscan.org/graphql',
    vmType: 'EVM'
  },
  { 
    id: 42161, 
    name: 'Arbitrum', 
    icon: '💙', 
    color: 'cyan-600', 
    graphqlUrl: 'https://arbitrum.easscan.org/graphql',
    vmType: 'EVM'
  },
  { 
    id: 137, 
    name: 'Polygon', 
    icon: '💜', 
    color: 'purple-500', 
    graphqlUrl: 'https://polygon.easscan.org/graphql',
    vmType: 'EVM'
  },
  { 
    id: 59144, 
    name: 'Linea', 
    icon: '🖤', 
    color: 'slate-200', 
    graphqlUrl: 'https://linea.easscan.org/graphql',
    vmType: 'EVM'
  },
  { 
    id: 534352, 
    name: 'Scroll', 
    icon: '📜', 
    color: 'amber-200', 
    graphqlUrl: 'https://scroll.easscan.org/graphql',
    vmType: 'EVM'
  },
  { 
    id: 42220, 
    name: 'Celo', 
    icon: '🟢', 
    color: 'green-400', 
    graphqlUrl: 'https://celo.easscan.org/graphql',
    vmType: 'EVM'
  },
  
  // --- SVM (Rust) ---
  {
    id: 'solana',
    name: 'Solana',
    icon: '🟣',
    color: 'purple-400',
    vmType: 'SVM'
  },

  // --- MoveVM ---
  {
    id: 'aptos',
    name: 'Aptos',
    icon: '⚫',
    color: 'slate-200',
    vmType: 'MoveVM'
  },
  {
    id: 'sui',
    name: 'Sui',
    icon: '💧',
    color: 'blue-300',
    vmType: 'MoveVM'
  }
];

export const POPULAR_SCHEMAS: SchemaDefinition[] = [
  {
    uid: '0xCLICK33379f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0REP',
    name: 'Clique TEE Reputation',
    description: 'Privacy-preserving AI reputation scoring computed inside a Trusted Execution Environment (Intel SGX) to ensure data confidentiality.',
    provider: 'Clique',
    category: 'DeFi',
    tags: ['TEE', 'Privacy', 'Confidential Compute'],
  },
  {
    uid: '0xHOLO78979f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0ZK',
    name: 'Holonym Gov ID',
    description: 'Uses Zero-Knowledge Proofs (ZK-SNARKs) to prove valid government residency without revealing the ID document itself.',
    provider: 'Holonym',
    category: 'ZK',
    tags: ['ZK-Proof', 'Privacy', 'Identity'],
  },
  {
    uid: '0xWORLD12379f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0ID',
    name: 'World ID Orb Verified',
    description: 'Biometric verification using the Orb to generate a ZK-proof of personhood, ensuring uniqueness without storing biometric data.',
    provider: 'Worldcoin',
    category: 'Biometric',
    tags: ['ZK-Proof', 'Iris Scan', 'PoP'],
  },
  {
    uid: '0x21065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0123',
    name: 'Gitcoin Passport Score',
    description: 'Aggregates multiple Web2 and Web3 stamps to calculate a Sybil resistance score using a quadratic weighting algorithm.',
    provider: 'Gitcoin',
    category: 'Identity',
    tags: ['Sybil Resistance', 'Aggregator'],
  },
  {
    uid: '0xTRUSTA99979f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0MEDIA',
    name: 'Trusta MEDIA Score',
    description: 'AI-driven reputation scoring that analyzes asset holding periods and interaction depth to identify high-value users.',
    provider: 'Trusta Labs',
    category: 'DeFi',
    tags: ['AI/ML', 'Behavioral Analysis'],
  },
  {
    uid: '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
    name: 'Coinbase Verified Account',
    description: 'Links an on-chain address to a KYC-verified Coinbase account using standard OAuth attestation flows.',
    provider: 'Coinbase',
    category: 'Identity',
    tags: ['KYC', 'CEX', 'OAuth'],
  },
  {
    uid: '0xGALXE45679f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0PASS',
    name: 'Galxe Passport v2',
    description: 'Identity verification system requiring standard KYC documentation and facial recognition checks.',
    provider: 'Galxe',
    category: 'Identity',
    tags: ['KYC', 'Compliance'],
  },
  {
    uid: '0x44065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0456',
    name: 'Region Verify',
    description: 'Attests to the user residing in a specific region or country for geofencing compliance.',
    provider: 'RegionDAO',
    category: 'Identity',
    tags: ['Location', 'Compliance'],
  },
  {
    uid: '0xFARC11179f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0CAST',
    name: 'Farcaster Active User',
    description: 'Verifies active social engagement and FID ownership on the Farcaster decentralized social graph.',
    provider: 'Farcaster',
    category: 'Social',
    tags: ['Social Graph', 'Activity'],
  },
  {
    uid: '0xCIVIC22279f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0PASS',
    name: 'Civic CAPTCHA Pass',
    description: 'Proof of liveness to ensure the user is human and not a bot, often using video verification.',
    provider: 'Civic',
    category: 'Biometric',
    tags: ['Liveness', 'Anti-Bot'],
  },
  {
    uid: '0x99065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0789',
    name: 'EAS Contributor',
    description: 'Recognized contributor credential for developers building on the Ethereum Attestation Service.',
    provider: 'EAS',
    category: 'Social',
    tags: ['Community', 'Dev'],
  },
  {
    uid: '0xAA065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0AAA',
    name: 'Superchain User',
    description: 'Tracks cross-chain activity across Optimism, Base, and Zora to build a Superchain reputation.',
    provider: 'Optimism',
    category: 'DeFi',
    tags: ['Activity', 'Cross-Chain'],
  }
];
