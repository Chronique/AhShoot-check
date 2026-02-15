import { JsonRpcProvider } from 'ethers';

// Use LlamaRPC or Ankr for better compatibility with ethers v6 ENS resolution.
// Cloudflare often returns "missing revert data" for ENS calls.
const provider = new JsonRpcProvider('https://eth.llamarpc.com');

export const resolveEnsName = async (name: string): Promise<string | null> => {
  // Basic validation
  if (!name || !name.includes('.')) return null;
  
  try {
    const address = await provider.resolveName(name);
    return address;
  } catch (e) {
    // Log warning instead of error to avoid cluttering console for typos
    console.warn(`ENS Resolution failed for ${name}:`, e);
    return null;
  }
};