
import { BrowserProvider, Contract } from 'ethers';
import { BASE_CHAIN_ID, TARGET_CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';
import { sdk } from '@farcaster/miniapp-sdk';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// 1. Silent Check (Auto-connect logic)
export const checkWalletConnection = async (): Promise<string | null> => {
  try {
      // Priority: Farcaster SDK Provider
      // We check if it exists and looks like a provider (has request method)
      if (sdk.wallet.ethProvider && typeof sdk.wallet.ethProvider.request === 'function') {
          try {
              const provider = new BrowserProvider(sdk.wallet.ethProvider as any);
              const accounts = await provider.listAccounts();
              if (accounts.length > 0) return accounts[0].address;
          } catch (e) { 
              console.warn("SDK Provider silent check failed:", e); 
          }
      }

      // Fallback: Window Ethereum
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        // listAccounts in v6 returns JsonRpcSigner[], so we get the address property
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          await switchNetwork(provider);
          return accounts[0].address;
        }
      }
      return null;
  } catch (error) {
    console.error("Silent connection check failed:", error);
    return null;
  }
};

// 2. Manual Connect
export const connectWallet = async (): Promise<string | null> => {
  let provider: BrowserProvider;

  try {
      if (sdk.wallet.ethProvider && typeof sdk.wallet.ethProvider.request === 'function') {
           provider = new BrowserProvider(sdk.wallet.ethProvider as any);
      } else if (window.ethereum) {
           provider = new BrowserProvider(window.ethereum);
      } else {
           alert("Wallet not found. If you are on mobile, please use a crypto wallet browser or the Farcaster app.");
           return null;
      }

      // Ethers v6: getSigner() internally calls eth_requestAccounts and handles the handshake
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      await switchNetwork(provider);
      return address;
  } catch (error: any) {
    console.error("Connection error:", error);
    // User rejected request
    if (error.code === 4001 || error?.info?.error?.code === 4001) {
        return null;
    }
    // Handle the specific "could not coalesce error" by showing a friendlier message
    if (error.message && error.message.includes("coalesce error")) {
         alert("Wallet connection failed. Please try unlocking your wallet manually and try again.");
    }
    return null;
  }
};

// Helper to switch network
const switchNetwork = async (provider: BrowserProvider) => {
    try {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== BASE_CHAIN_ID) {
            try {
                // We use the low-level send command to ensure compatibility
                await provider.send('wallet_switchEthereumChain', [{ chainId: '0x2105' }]); // 8453
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902 || switchError?.error?.code === 4902) {
                    alert("Please switch your wallet to Base Network manually.");
                }
                // Don't throw here, just warn, as some wallets might not support programmatic switching but still work
                console.warn("Network switch request failed:", switchError);
            }
        }
    } catch (e) {
        console.warn("Network check failed:", e);
    }
}

// --- GM PORTAL CONTRACT INTERACTION ---

export const sayGM = async (): Promise<boolean> => {
    try {
        let provider: BrowserProvider;
        if (sdk.wallet.ethProvider && typeof sdk.wallet.ethProvider.request === 'function') {
            provider = new BrowserProvider(sdk.wallet.ethProvider as any);
        } else if (window.ethereum) {
            provider = new BrowserProvider(window.ethereum);
        } else {
            return false;
        }

        const signer = await provider.getSigner();
        const contract = new Contract(TARGET_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // We use attest() because the user wants to "Verify Schema" (Create Attestation)
        const tx = await contract.attest(); 
        console.log("Attestation Tx Sent:", tx.hash);
        await tx.wait(); // Wait for block confirmation
        return true;
    } catch (e: any) {
        console.error("Verification Failed:", e);
        if (e.code === 4001 || e?.info?.error?.code === 4001) return false;
        return false;
    }
}

export const getStreak = async (address: string): Promise<number> => {
    try {
        let provider: BrowserProvider;
        if (sdk.wallet.ethProvider && typeof sdk.wallet.ethProvider.request === 'function') {
             provider = new BrowserProvider(sdk.wallet.ethProvider as any);
        } else if (window.ethereum) {
             provider = new BrowserProvider(window.ethereum);
        } else {
             return 0;
        }
        
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
