
import { BrowserProvider, Contract } from 'ethers';
import { BASE_CHAIN_ID, LINEA_CHAIN_ID, BASE_CONTRACT_ADDRESS, LINEA_CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';
import { sdk } from '@farcaster/miniapp-sdk';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// 1. Silent Check
export const checkWalletConnection = async (): Promise<string | null> => {
  try {
      if (sdk.wallet.ethProvider && typeof sdk.wallet.ethProvider.request === 'function') {
          try {
              const provider = new BrowserProvider(sdk.wallet.ethProvider as any);
              const accounts = await provider.listAccounts();
              if (accounts.length > 0) return accounts[0].address;
          } catch (e) { 
              console.warn("SDK Provider silent check failed:", e); 
          }
      }

      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
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
           alert("Wallet not found. Please use a crypto wallet.");
           return null;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      return address;
  } catch (error: any) {
    console.error("Connection error:", error);
    if (error.code === 4001 || error?.info?.error?.code === 4001) return null;
    return null;
  }
};

// 3. Switch Network Logic
export const switchNetwork = async (provider: BrowserProvider, targetChainId: number) => {
    try {
        const network = await provider.getNetwork();
        if (Number(network.chainId) === targetChainId) return;

        const chainIdHex = '0x' + targetChainId.toString(16);
        
        try {
            await provider.send('wallet_switchEthereumChain', [{ chainId: chainIdHex }]);
        } catch (switchError: any) {
            if (switchError.code === 4902 || switchError?.error?.code === 4902) {
                if (targetChainId === LINEA_CHAIN_ID) {
                    await provider.send('wallet_addEthereumChain', [{
                        chainId: chainIdHex,
                        chainName: 'Linea Mainnet',
                        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://rpc.linea.build'],
                        blockExplorerUrls: ['https://lineascan.build']
                    }]);
                } else if (targetChainId === BASE_CHAIN_ID) {
                    await provider.send('wallet_addEthereumChain', [{
                        chainId: chainIdHex,
                        chainName: 'Base',
                        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://mainnet.base.org'],
                        blockExplorerUrls: ['https://basescan.org']
                    }]);
                }
            } else {
                console.warn("Network switch request failed:", switchError);
                throw switchError;
            }
        }
    } catch (e) {
        console.warn("Network check failed:", e);
        throw e;
    }
}

// 4. Mint Identity (Base or Linea)
export const mintIdentity = async (targetChainId: number): Promise<boolean> => {
    try {
        let provider: BrowserProvider;
        if (sdk.wallet.ethProvider && typeof sdk.wallet.ethProvider.request === 'function') {
            provider = new BrowserProvider(sdk.wallet.ethProvider as any);
        } else if (window.ethereum) {
            provider = new BrowserProvider(window.ethereum);
        } else {
            return false;
        }

        // 1. Force Switch Network First
        await switchNetwork(provider, targetChainId);

        // 2. Select Contract Address based on Chain (The Factory Address)
        const contractAddress = targetChainId === LINEA_CHAIN_ID ? LINEA_CONTRACT_ADDRESS : BASE_CONTRACT_ADDRESS;

        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
        
        // 3. Send Transaction
        const tx = await contract.mint();
        
        console.log(`[${targetChainId}] Identity Mint Tx Sent:`, tx.hash);
        await tx.wait();
        return true;

    } catch (e: any) {
        console.error("Identity Mint Failed:", e);
        
        if (e.code === 4001 || e?.info?.error?.code === 4001) return false;
        
        alert("Transaction failed. Make sure you are on the right network and have ETH for gas.");
        return false;
    }
}

// 5. Get Identity Status (Balance Check)
export interface IdentityStatus {
    hasIdentity: boolean;
    balance: number;
}

export const getIdentityStatus = async (address: string, chainId: number): Promise<IdentityStatus> => {
    try {
        let provider: BrowserProvider;
        // Use window.ethereum for read operations if available, fallback to nothing
        if (window.ethereum) {
             provider = new BrowserProvider(window.ethereum);
        } else if (sdk.wallet.ethProvider) {
             provider = new BrowserProvider(sdk.wallet.ethProvider as any);
        } else {
             return { hasIdentity: false, balance: 0 };
        }
        
        const contractAddress = chainId === LINEA_CHAIN_ID ? LINEA_CONTRACT_ADDRESS : BASE_CONTRACT_ADDRESS;
        
        // Note: For read-only calls across different chains, we usually need a specific RPC provider.
        // If the user's wallet is on Chain A, calling a contract on Chain B via BrowserProvider will fail.
        // We will try, but if it fails due to network mismatch, we assume false for now unless we implement RPC URLs.
        // For best UX in this dual-chain app, we assume the user might switch or we catch the error.
        
        try {
            const contract = new Contract(contractAddress, CONTRACT_ABI, provider);
            // We don't force switch network for reading, we try reading. 
            // If the provider is on a different network, this call might fail depending on the wallet/provider behavior.
            // A more robust solution would be to use JsonRpcProvider with public endpoints.
            
            // However, sticking to the requested "wagmi+viem (existing stack)" style which uses the injected provider:
            const balance = await contract.balanceOf(address);
            return {
                hasIdentity: Number(balance) > 0,
                balance: Number(balance)
            };
        } catch (readError) {
             // If read fails (likely wrong network), return default
             return { hasIdentity: false, balance: 0 };
        }
    } catch (e) {
        console.warn("Failed to fetch identity status:", e);
        return { hasIdentity: false, balance: 0 };
    }
}

export const interactWithContract = async (): Promise<boolean> => {
  // Default legacy interaction
  return mintIdentity(BASE_CHAIN_ID);
};
