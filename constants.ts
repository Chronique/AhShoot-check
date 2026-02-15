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

// Note: UIDs here are examples. In a real multi-chain scenario, UIDs differ per chain.
// For the Explorer functionality, we fetch whatever the user actually has.
export const POPULAR_SCHEMAS: SchemaDefinition[] = [
  {
    uid: '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
    name: 'Coinbase Verified Account',
    description: 'Verifies that the user has a valid Coinbase account with KYC.',
    provider: 'Coinbase',
    category: 'Identity',
    tags: ['KYC', 'CEX'],
  },
  {
    uid: '0x21065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0123',
    name: 'Gitcoin Passport Score',
    description: 'Contains the anti-sybil score for the user from Gitcoin Passport.',
    provider: 'Gitcoin',
    category: 'Identity',
    tags: ['Sybil Resistance', 'Public Goods'],
  },
  {
    uid: '0xTRUSTA99979f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0MEDIA',
    name: 'Trusta MEDIA Score',
    description: 'AI-driven reputation scoring analyzing on-chain behavior and asset value.',
    provider: 'Trusta Labs',
    category: 'DeFi',
    tags: ['Reputation', 'Sybil Score', 'AI'],
  },
  {
    uid: '0xWORLD12379f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0ID',
    name: 'World ID Orb Verified',
    description: 'Proof of Personhood verified via biometric Orb scan.',
    provider: 'Worldcoin',
    category: 'Biometric',
    tags: ['PoP', 'Iris Scan', 'Sybil Resistance'],
  },
  {
    uid: '0xGALXE45679f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0PASS',
    name: 'Galxe Passport v2',
    description: 'Comprehensive identity verification including KYC and social linking.',
    provider: 'Galxe',
    category: 'Identity',
    tags: ['KYC', 'Web3 Credential'],
  },
  {
    uid: '0xHOLO78979f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0ZK',
    name: 'Holonym Gov ID',
    description: 'Zero-knowledge proof of valid government ID without revealing details.',
    provider: 'Holonym',
    category: 'ZK',
    tags: ['Privacy', 'Government ID'],
  },
  {
    uid: '0x44065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0456',
    name: 'Region Verify',
    description: 'Attests to the user residing in a specific region or country.',
    provider: 'RegionDAO',
    category: 'Identity',
    tags: ['Location', 'Compliance'],
  },
  {
    uid: '0xFARC11179f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0CAST',
    name: 'Farcaster Active User',
    description: 'Verifies active social engagement and FID ownership on Farcaster.',
    provider: 'Farcaster',
    category: 'Social',
    tags: ['Social Graph', 'Activity'],
  },
  {
    uid: '0xCIVIC22279f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0PASS',
    name: 'Civic CAPTCHA Pass',
    description: 'Proof of liveness and non-bot behavior.',
    provider: 'Civic',
    category: 'Biometric',
    tags: ['Liveness', 'Bot Prevention'],
  },
  {
    uid: '0x99065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0789',
    name: 'EAS Contributor',
    description: 'Recognized contributor to the Ethereum Attestation Service ecosystem.',
    provider: 'EAS',
    category: 'Social',
    tags: ['Community', 'Dev'],
  },
  {
    uid: '0xAA065c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0AAA',
    name: 'Superchain User',
    description: 'Active user across the OP Stack Superchain.',
    provider: 'Optimism',
    category: 'DeFi',
    tags: ['Activity', 'On-chain'],
  },
  {
    uid: '0xCLICK33379f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0REP',
    name: 'Clique TEE Reputation',
    description: 'Privacy-preserving AI reputation scoring executed in a Trusted Execution Environment (TEE).',
    provider: 'Clique',
    category: 'DeFi',
    tags: ['Reputation', 'AI', 'TEE', 'Privacy'],
  }
];