
import { Chain, SchemaDefinition } from './types';

// --- CORE INTERACTION CONSTANTS ---

// BASE (Identity Factory - NFT)
export const BASE_CHAIN_ID = 8453;
// Alamat Contract Factory Baru (sesuai request user)
export const BASE_CONTRACT_ADDRESS = '0xA32ab3E155A9B8b13FbbD5D3F7339702c899fE39'; 
export const BASE_SCHEMA_UID = '0xa043c275aa1f5b501fbc3078a496624cb2c96a0de07dc77861e7f57d2a90c6e5';

// LINEA (Identity Factory - SBT)
export const LINEA_CHAIN_ID = 59144;
export const LINEA_CONTRACT_ADDRESS = '0x3C5F31E167bA64Bc693B4d32517e2f81d61Bc64A'; 
export const LINEA_SCHEMA_ID = '0x32b5753e506972049e2187b5a5e3077751c3132e0e025816913169046777063d';

// DEPRECATED: For backward compatibility
export const TARGET_SCHEMA_UID = BASE_SCHEMA_UID;
export const TARGET_CONTRACT_ADDRESS = BASE_CONTRACT_ADDRESS;

// UPDATED ABI for Identity Factory & Tokens
export const FACTORY_ABI = [
  // Core Interaction
  "function mint() external",           // Linea uses 'mint'
  "function mintIdentity() external",   // Base Factory uses 'mintIdentity'
  "function attestIdentity() external", // Base Factory step 2
  
  // Events
  "event IdentityAttested(address indexed recipient, bytes32 uid)",
  
  // View Functions to get the actual Token Contract Address
  "function nft() external view returns (address)", // Base Factory
  "function sbt() external view returns (address)"  // Linea Factory
];

export const ERC721_ABI = [
  "function balanceOf(address owner) external view returns (uint256)"
];

// --- CHAINS CONFIGURATION ---
export const CHAINS: Chain[] = [
  { 
    id: 8453, 
    name: 'Base', 
    color: 'blue-500', 
    logoUrl: 'https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png',
    graphqlUrl: 'https://base.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 59144, 
    name: 'Linea', 
    color: 'zinc-100', // White/Black theme
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png',
    graphqlUrl: 'https://graph-query.linea.build/subgraphs/name/Consensys/linea-attestation-registry', // Verax Subgraph
    vmType: 'EVM',
    group: 'ZK Rollups'
  },
  { 
    id: 1, 
    name: 'Ethereum', 
    color: 'slate-600', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    graphqlUrl: 'https://easscan.org/graphql',
    vmType: 'EVM',
    group: 'Ethereum Mainnet'
  },
  { 
    id: 10, 
    name: 'Optimism', 
    color: 'red-500', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
    graphqlUrl: 'https://optimism.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 42161, 
    name: 'Arbitrum One', 
    color: 'blue-400', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
    graphqlUrl: 'https://arbitrum.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Arbitrum'
  },
  { 
    id: 137, 
    name: 'Polygon', 
    color: 'purple-500', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
    graphqlUrl: 'https://polygon.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Sidechains'
  },
  { 
    id: 534352, 
    name: 'Scroll', 
    color: 'orange-100', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/info/logo.png',
    graphqlUrl: 'https://scroll.easscan.org/graphql',
    vmType: 'EVM',
    group: 'ZK Rollups'
  },
  { 
    id: 11155111, 
    name: 'Sepolia', 
    color: 'slate-400', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    graphqlUrl: 'https://sepolia.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Testnets'
  }
];

// Helper to get Chains
export const BASE_CHAIN = CHAINS.find(c => c.id === BASE_CHAIN_ID)!;
export const LINEA_CHAIN = CHAINS.find(c => c.id === LINEA_CHAIN_ID)!;

// --- POPULAR SCHEMAS ---
export const POPULAR_SCHEMAS: SchemaDefinition[] = [
  {
    uid: '0x1', 
    name: 'Coinbase Ecosystem',
    description: 'Verified participant in the Coinbase on-chain ecosystem.',
    provider: 'Coinbase',
    logoUrl: 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4',
    docsUrl: 'https://www.coinbase.com/',
    category: 'Identity',
    tags: ['Coinbase', 'Ecosystem'],
    ecosystem: 'Base',
  },
  {
    uid: BASE_SCHEMA_UID,
    name: 'Verified User',
    description: 'General verified user status across supported networks.',
    provider: 'Identity Protocol',
    logoUrl: 'https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png',
    docsUrl: 'https://base.org',
    category: 'Identity',
    tags: ['Verified', 'User'],
    ecosystem: 'Base',
  },
  {
    uid: '0x2', 
    name: 'Coinbase One',
    description: 'Verification for Coinbase One members.',
    provider: 'Coinbase',
    logoUrl: 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4',
    docsUrl: 'https://www.coinbase.com/one',
    category: 'Identity',
    tags: ['Coinbase', 'Premium'],
    ecosystem: 'Base',
  },
  {
    uid: '0x3', 
    name: 'Verified Country',
    description: 'Proof of residency or nationality verification.',
    provider: 'Identity Provider',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    docsUrl: 'https://identity.org',
    category: 'Identity',
    tags: ['KYC', 'Country'],
    ecosystem: 'Base',
  },
  {
    uid: '0x4', 
    name: 'Farcaster UID',
    description: 'Unique identifier for Farcaster protocol users.',
    provider: 'Farcaster',
    logoUrl: 'https://raw.githubusercontent.com/farcasterxyz/docs/main/docs/public/icon.png',
    docsUrl: 'https://farcaster.xyz/',
    category: 'Social',
    tags: ['Social', 'Farcaster'],
    ecosystem: 'Base',
  },
  {
    uid: '0x5', 
    name: 'Verax',
    description: 'Attestation registry for the Linea ecosystem and beyond.',
    provider: 'Verax',
    logoUrl: 'https://raw.githubusercontent.com/Consensys/linea-attestation-registry/dev/doc/verax-logo-circle.png?raw=true',
    docsUrl: 'https://explorer.ver.ax/',
    category: 'Identity',
    tags: ['Verax', 'Linea', 'Attestation'],
    ecosystem: 'Verax',
  },
  {
    uid: '0x6',
    name: 'HUMN',
    description: 'Aggregated sybil resistance score based on multiple social and on-chain stamps.',
    provider: 'Gitcoin',
    logoUrl: 'https://github.com/passportxyz/passport-docs/blob/main/public/favicon.png?raw=true',
    docsUrl: 'https://passport.gitcoin.co/',
    category: 'Identity',
    tags: ['Sybil', 'Score'],
    ecosystem: 'Verax',
  },
  {
    uid: '0x7',
    name: 'zkPass',
    description: 'Privacy-preserving identity verification using Zero-Knowledge Proofs.',
    provider: 'zkPass',
    logoUrl: 'https://github.com/zkPassOfficial/website/blob/master/public/android-chrome-192x192.png?raw=true',
    docsUrl: 'https://zkpass.org/',
    category: 'Identity',
    tags: ['ZKP', 'Privacy'],
    ecosystem: 'Verax',
  }
];

export const CUSTOM_CONTRACTS = { 
    GMPORTAL_BASE: BASE_CONTRACT_ADDRESS
};
