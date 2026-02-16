import { JsonRpcProvider } from 'ethers';

// List of reliable public RPC endpoints for Ethereum Mainnet.
// We use a fallback strategy: if the first one fails, we try the next.
const RPC_URLS = [
  'https://eth.llamarpc.com',      // Often the most reliable for public reads
  'https://rpc.ankr.com/eth',      // Very stable public tier
  'https://cloudflare-eth.com',    // Good backup
  'https://1rpc.io/eth'            // Privacy focused backup
];

export const resolveEnsName = async (name: string): Promise<string | null> => {
  // Basic validation to prevent wasting calls on non-ENS strings
  if (!name || !name.includes('.') || name.length < 4) return null;

  // Iterate through providers until one succeeds
  for (const url of RPC_URLS) {
    try {
      // We create a fresh provider instance for the request to ensure no stale state.
      // Ethers v6 JsonRpcProvider is lightweight.
      const provider = new JsonRpcProvider(url);
      
      // Attempt resolution
      const address = await provider.resolveName(name);
      
      if (address) {
        return address;
      }
    } catch (e) {
      // Log warning but continue to the next RPC
      console.warn(`ENS lookup failed on ${url} for ${name}. Trying next provider...`);
      continue;
    }
  }

  // If all providers fail
  console.error(`All RPCs failed to resolve ENS: ${name}`);
  return null;
};