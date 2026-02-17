
import { Chain, SchemaDefinition } from './types';

// --- CORE INTERACTION CONSTANTS ---

// BASE (Identity Factory - NFT)
export const BASE_CHAIN_ID = 8453;
export const BASE_CONTRACT_ADDRESS = '0x80c63A0cd413F812Fe10e9983BB388bfCbDe8F17'; 
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
  "function mint() external",
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
  }
];

// Helper to get Chains
export const BASE_CHAIN = CHAINS.find(c => c.id === BASE_CHAIN_ID)!;
export const LINEA_CHAIN = CHAINS.find(c => c.id === LINEA_CHAIN_ID)!;

// --- POPULAR SCHEMAS ---
export const POPULAR_SCHEMAS: SchemaDefinition[] = [
  {
    uid: BASE_SCHEMA_UID,
    name: 'Verified Base User',
    description: 'Verifies interaction with the official GM Portal contract on Base. The standard for active Base users.',
    provider: 'Base Portal',
    logoUrl: 'https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png',
    docsUrl: 'https://base.org',
    category: 'Identity',
    tags: ['Base', 'On-Chain', 'EAS'],
  },
  {
    uid: LINEA_SCHEMA_ID,
    name: 'Linea Soulbound ID',
    description: 'A permanent, non-transferable identity token (SBT) minted via Verax on Linea.',
    provider: 'Linea Portal',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png',
    docsUrl: 'https://ver.ax',
    category: 'Identity',
    tags: ['Linea', 'SBT', 'Verax'],
  },
  {
    uid: '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
    name: 'Coinbase Verified Account',
    description: 'The official verification schema from Coinbase. Confirms the wallet owner has completed KYC on Coinbase exchange.',
    provider: 'Coinbase',
    logoUrl: 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4',
    docsUrl: 'https://www.coinbase.com/onchain-verify',
    category: 'Identity',
    tags: ['Base Network', 'KYC', 'CEX'],
  },
  {
    uid: '0x32b5753e506972049e2187b5a5e3077751c3132e0e025816913169046777063d',
    name: 'Farcaster ID',
    description: 'Links an Ethereum address to a Farcaster ID (FID), proving social identity on the decentralized protocol.',
    provider: 'Farcaster',
    logoUrl: 'https://raw.githubusercontent.com/farcasterxyz/docs/main/docs/public/icon.png',
    docsUrl: 'https://farcaster.xyz/',
    category: 'Social',
    tags: ['Optimism Network', 'Social Graph', 'Lens'],
  },
  {
    uid: '0xe88a101f8016489370603732488889988960098889600988890989908989809809809809', 
    name: 'Buildathon Participant',
    description: 'Awarded to developers who participate in Onchain Summer or Base Buildathons.',
    provider: 'Base',
    logoUrl: 'https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png',
    docsUrl: 'https://www.base.org/build',
    category: 'Social',
    tags: ['Base Network', 'Developer', 'Hackathon'],
  }
];

export const CUSTOM_CONTRACTS = { 
    GMPORTAL_BASE: BASE_CONTRACT_ADDRESS,
    GMPORTAL_LINEA: LINEA_CONTRACT_ADDRESS
};
