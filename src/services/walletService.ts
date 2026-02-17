
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';
import { BASE_CHAIN_ID, TARGET_CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';
import { sdk } from '@farcaster/miniapp-sdk';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// 1. Silent Check (Auto-connect logic)
export const checkWalletConnection = async (): Promise<string | null> => {
  // Priority: Farcaster SDK Provider
  if (sdk.wallet.ethProvider) {
      try {
          const provider = new BrowserProvider(sdk.wallet.ethProvider);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) return accounts[0].address;
      } catch (e) { console.warn("SDK Provider check failed", e); }
  }

  // Fallback: Window Ethereum
  if (!window.ethereum) return null;

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    
    if (accounts.length > 0) {
      await switchNetwork(provider);
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error("Silent connection check failed:", error);
    return null;
  }
};

// 2. Manual Connect
export const connectWallet = async (): Promise<string | null> => {
  let provider;

  if (sdk.wallet.ethProvider) {
      provider = new BrowserProvider(sdk.wallet.ethProvider);
  } else if (window.ethereum) {
      provider = new BrowserProvider(window.ethereum);
  } else {
      alert("Wallet not found.");
      return null;
  }

  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    await switchNetwork(provider);
    return accounts[0];
  } catch (error) {
    console.error("Connection error:", error);
    return null;
  }
};

// Helper to switch network
const switchNetwork = async (provider: BrowserProvider) => {
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      try {
        const reqProvider = provider.provider as any; 
        await reqProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // 8453 in hex
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
             alert("Please switch your wallet to Base Network.");
        }
        throw switchError;
      }
    }
}

// --- GM PORTAL CONTRACT INTERACTION ---

// Updated: sayGM now calls 'attest' to create the schema verification on-chain
export const sayGM = async (): Promise<boolean> => {
    try {
        const provider = sdk.wallet.ethProvider ? new BrowserProvider(sdk.wallet.ethProvider) : new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(TARGET_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // We use attest() because the user wants to "Verify Schema" (Create Attestation)
        const tx = await contract.attest(); 
        console.log("Attestation Tx Sent:", tx.hash);
        await tx.wait(); // Wait for block confirmation
        return true;
    } catch (e: any) {
        console.error("Verification Failed:", e);
        
        // Handle User Rejection
        if (e.code === 4001 || e?.info?.error?.code === 4001) {
            return false;
        }

        // Fallback for dev mode simulation
        if (process.env.NODE_ENV === 'development') {
            console.warn("Dev mode: Simulating Attestation success");
            return new Promise(resolve => setTimeout(() => resolve(true), 2000));
        }
        return false;
    }
}

export const getStreak = async (address: string): Promise<number> => {
    try {
        const provider = sdk.wallet.ethProvider ? new BrowserProvider(sdk.wallet.ethProvider) : new BrowserProvider(window.ethereum);
        const contract = new Contract(TARGET_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const streak = await contract.getStreak(address);
        return Number(streak);
    } catch (e) {
        return 0; 
    }
}

export const interactWithContract = async (): Promise<boolean> => {
  return sayGM();
};
