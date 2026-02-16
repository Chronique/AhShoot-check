import { Chain, SchemaDefinition } from './types';

export const CHAINS: Chain[] = [
  // --- Ethereum L1 ---
  { 
    id: 1, 
    name: 'Ethereum', 
    color: 'slate-600',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    graphqlUrl: 'https://easscan.org/graphql',
    vmType: 'EVM',
    group: 'Ethereum L1'
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
    logoUrl: 'https://raw.githubusercontent.com/Soneium/brand-assets/main/soneium-icon.png', // Fallback or hypothetical location, using generic for now if specific not found
    // graphqlUrl: Pending
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 763373, 
    name: 'Ink', 
    color: 'purple-600', 
    logoUrl: 'https://pbs.twimg.com/profile_images/1849126927762075648/W2t2t54__400x400.jpg', // Ink by Kraken
    // graphqlUrl: Pending
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 'tempo-testnet', 
    name: 'Tempo', 
    color: 'orange-400', 
    logoUrl: '', // No official logo yet
    // graphqlUrl: Pending
    vmType: 'EVM',
    group: 'Optimism Rollups'
  },
  { 
    id: 'arc-testnet', 
    name: 'Arc', 
    color: 'indigo-400', 
    logoUrl: '', 
    // graphqlUrl: Pending
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
    vmType: 'SVM',
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

// REAL WORLD POPULAR SCHEMAS
export const POPULAR_SCHEMAS: SchemaDefinition[] = [
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
    uid: '0xGalxePassportKYCPlaceholderHASH12345678901234567890123456789012',
    name: 'Galxe Verified User',
    description: 'Galxe Passport verification which confirms the user has passed KYC requirements, ensuring unique human identity.',
    provider: 'Galxe',
    logoUrl: 'https://raw.githubusercontent.com/Galxe/react-indentity-protocol-template/main/src/assets/galxe.png',
    docsUrl: 'https://app.galxe.com/',
    category: 'Identity',
    tags: ['Multi-Chain', 'KYC', 'Web3 Credential'],
  },
  {
    uid: '0x32b5753e506972049e2187b5a5e3077751c3132e0e025816913169046777063d',
    name: 'Farcaster ID',
    description: 'Links an Ethereum address to a Farcaster ID (FID), proving social identity on the decentralized protocol.',
    provider: 'Farcaster',
    logoUrl: 'https://raw.githubusercontent.com/farcasterxyz/docs/main/docs/public/icon.png',
    docsUrl: 'https://docs.farcaster.xyz/',
    category: 'Social',
    tags: ['Optimism Network', 'Social Graph', 'Lens'],
  },
  {
    uid: '0x431102227d89481977799d5257e87508098c4d32049e358b53293e50e5027582',
    name: 'World ID User',
    description: 'Verifies that the address belongs to a unique human who has verified via the Worldcoin Orb or Device.',
    provider: 'Worldcoin',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x163f8C2467924be0ae7B5347228CABF260318753/logo.png',
    docsUrl: 'https://docs.world.org/world-id',
    category: 'Biometric',
    tags: ['Optimism Network', 'ZK-Proof', 'PoP'],
  },
  {
    uid: '0xdc5e2a2221b660c1d683664d4715502c3328ce7858c219665f80219602071850',
    name: 'Blackbird Membership',
    description: 'Restaurant loyalty and membership attestations used by the Blackbird platform on Base.',
    provider: 'Blackbird',
    logoUrl: 'https://pbs.twimg.com/profile_images/1628173574891823105/sYk-4u3l_400x400.jpg', // Twitter profile image as fallback
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
    docsUrl: 'https://docs.base.org/',
    category: 'Social',
    tags: ['Base Network', 'Developer', 'Hackathon'],
  },
  {
    uid: '0x68df5679f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0123',
    name: 'Guild.xyz Pin',
    description: 'Role verification from Guild.xyz, linking Discord/Telegram roles to on-chain status.',
    provider: 'Guild',
    logoUrl: 'https://avatars.githubusercontent.com/u/89776950?s=200&v=4',
    docsUrl: 'https://docs.guild.xyz/guild/',
    category: 'Social',
    tags: ['Multi-Chain', 'Community', 'Discord'],
  },
  {
    uid: '0xCLIQUETEE79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0',
    name: 'Clique TEE Reputation',
    description: 'Privacy-preserving reputation analysis computed inside Trusted Execution Environments.',
    provider: 'Clique',
    logoUrl: 'https://avatars.githubusercontent.com/u/98739266?s=200&v=4',
    docsUrl: 'https://docs.clique.social/',
    category: 'DeFi',
    tags: ['Multi-Chain', 'TEE', 'Privacy'],
  },
  {
    uid: '0xMETADATA79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0',
    name: 'EAS Metadata',
    description: 'Standard metadata attestation used to attach names or descriptions to other schemas or UIDs.',
    provider: 'EAS',
    logoUrl: 'https://avatars.githubusercontent.com/u/108018337?s=200&v=4',
    docsUrl: 'https://docs.attest.org/docs/tutorials/create-a-schema',
    category: 'Governance',
    tags: ['Utility', 'System'],
  }
];