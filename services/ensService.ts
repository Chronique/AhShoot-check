import { JsonRpcProvider } from 'ethers';

// Use Ankr RPC which is generally more stable for eth_call than LlamaRPC public endpoint
const provider = new JsonRpcProvider('https://rpc.ankr.com/eth');

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