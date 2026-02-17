
import { Chain, SchemaDefinition } from './types';

// --- CORE INTERACTION CONSTANTS ---
// Schema UID provided by user
export const TARGET_SCHEMA_UID = '0xa043c275aa1f5b501fbc3078a496624cb2c96a0de07dc77861e7f57d2a90c6e5';

// Contract Address provided by user
export const TARGET_CONTRACT_ADDRESS = '0x093Bd5257113378763C45aBdd4eB9599E83e752d'; 
export const BASE_CHAIN_ID = 8453;

// ABI for the GM Portal Contract
export const CONTRACT_ABI = [
  "function attest() public payable",
  "function sayGM() public",
  "function getStreak(address user) public view returns (uint256)",
  "function lastGMTime(address user) public view returns (uint256)",
  "event GM(address indexed user, uint256 timestamp)"
];

// --- CHAINS CONFIGURATION ---
export const CHAINS: Chain[] = [
  // --- Ethereum L1 ---
  { 
    id: 1, 
    name: 'Ethereum', 
    color: 'slate-600', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    graphqlUrl: 'https://easscan.org/graphql',
    vmType: 'EVM',
    group: 'Ethereum Mainnet'
  },
  
  // --- Optimistic Rollups ---
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
    id: 8453, 
    name: 'Base', 
    color: 'blue-500', 
    logoUrl: 'https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png',
    graphqlUrl: 'https://base.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 42161, 
    name: 'Arbitrum', 
    color: 'cyan-600', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
    graphqlUrl: 'https://arbitrum.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 1946, 
    name: 'Soneium', 
    color: 'slate-400', 
    logoUrl: 'https://raw.githubusercontent.com/Soneium/brand-assets/main/soneium-icon.png', 
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 763373, 
    name: 'Ink', 
    color: 'purple-600', 
    logoUrl: 'https://pbs.twimg.com/profile_images/1849126927762075648/W2t2t54__400x400.jpg', 
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 'tempo-testnet', 
    name: 'Tempo', 
    color: 'orange-400', 
    logoUrl: '', 
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 'arc-testnet', 
    name: 'Arc', 
    color: 'indigo-400', 
    logoUrl: '', 
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },

  // --- ZK Rollups ---
  { 
    id: 59144, 
    name: 'Linea', 
    color: 'zinc-800', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png',
    graphqlUrl: 'https://linea.easscan.org/graphql',
    vmType: 'EVM',
    group: 'ZK Rollups'
  },
  { 
    id: 534352, 
    name: 'Scroll', 
    color: 'amber-600', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/info/logo.png',
    graphqlUrl: 'https://scroll.easscan.org/graphql',
    vmType: 'EVM',
    group: 'ZK Rollups'
  },

  // --- Sidechains / Validium / L1s ---
  { 
    id: 137, 
    name: 'Polygon', 
    color: 'purple-500', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
    graphqlUrl: 'https://polygon.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Sidechains / Validium'
  },
  { 
    id: 42220, 
    name: 'Celo', 
    color: 'green-400', 
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png',
    graphqlUrl: 'https://celo.easscan.org/graphql',
    vmType: 'EVM',
    group: 'Sidechains / Validium'
  },
  
  // --- SVM ---
  {
    id: 'solana',
    name: 'Solana',
    color: 'purple-400',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
    vmType: 'SVM', // Will need Mock or Specific adapter
    group: 'SVM'
  },

  // --- MoveVM ---
  {
    id: 'aptos',
    name: 'Aptos',
    color: 'slate-200',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/info/logo.png',
    vmType: 'MoveVM',
    group: 'MoveVM'
  },
  {
    id: 'sui',
    name: 'Sui',
    color: 'blue-300',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sui/info/logo.png',
    vmType: 'MoveVM',
    group: 'MoveVM'
  }
];

// Helper to get Base chain easily for default actions
export const BASE_CHAIN = CHAINS.find(c => c.id === BASE_CHAIN_ID)!;

// --- POPULAR SCHEMAS ---
export const POPULAR_SCHEMAS: SchemaDefinition[] = [
  {
    uid: TARGET_SCHEMA_UID,
    name: 'Verified Base User',
    description: 'Verifies interaction with the official GM Portal contract on Base. The standard for active Base users.',
    provider: 'Base Portal',
    logoUrl: 'https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png',
    docsUrl: 'https://base.org',
    category: 'Identity',
    tags: ['Base', 'On-Chain'],
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
    uid: '0x6ab5d34260fca0cfcfbc73046ce61b3977cc41629f8d4651845e9b7f11bab1d7',
    name: 'Gitcoin Passport Score',
    description: 'Sybil resistance score. NOTE: Gitcoin Passport primarily issues attestations on Optimism (L2) to save gas.',
    provider: 'Gitcoin',
    logoUrl: 'https://raw.githubusercontent.com/passportxyz/passport-docs/main/public/favicon.png',
    docsUrl: 'https://docs.passport.xyz/',
    category: 'Identity',
    tags: ['Optimism Network', 'Sybil Resistance', 'Score'],
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
    uid: '0x431102227d89481977799d5257e87508098c4d32049e358b53293e50e5027582',
    name: 'World ID User',
    description: 'Verifies that the address belongs to a unique human who has verified via the Worldcoin Orb or Device.',
    provider: 'Worldcoin',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x163f8C2467924be0ae7B5347228CABF260318753/logo.png',
    docsUrl: 'https://world.org/',
    category: 'Biometric',
    tags: ['Optimism Network', 'ZK-Proof', 'PoP'],
  },
  {
    uid: '0xdc5e2a2221b660c1d683664d4715502c3328ce7858c219665f80219602071850',
    name: 'Blackbird Membership',
    description: 'Restaurant loyalty and membership attestations used by the Blackbird platform on Base.',
    provider: 'Blackbird',
    logoUrl: 'https://pbs.twimg.com/profile_images/1628173574891823105/sYk-4u3l_400x400.jpg', 
    docsUrl: 'https://www.blackbird.xyz/',
    category: 'Social',
    tags: ['Base Network', 'Loyalty', 'Consumer'],
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
  },
  {
    uid: '0x68df5679f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0123',
    name: 'Guild.xyz Pin',
    description: 'Role verification from Guild.xyz, linking Discord/Telegram roles to on-chain status.',
    provider: 'Guild',
    logoUrl: 'https://avatars.githubusercontent.com/u/89776950?s=200&v=4',
    docsUrl: 'https://guild.xyz/explorer',
    category: 'Social',
    tags: ['Multi-Chain', 'Community', 'Discord'],
  }
];

export const CUSTOM_CONTRACTS = { GMPORTAL_BASE: TARGET_CONTRACT_ADDRESS };
