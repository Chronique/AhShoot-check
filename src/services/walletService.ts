
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import { BASE_CHAIN_ID, LINEA_CHAIN_ID, BASE_CONTRACT_ADDRESS, LINEA_CONTRACT_ADDRESS, FACTORY_ABI, ERC721_ABI } from '../constants';
import { sdk } from '@farcaster/miniapp-sdk';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Helper to get the raw ethereum provider
const getRawProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        return window.ethereum;
    }
    if (typeof sdk !== 'undefined' && sdk.wallet?.ethProvider) {
        return sdk.wallet.ethProvider;
    }
    return null;
};

// 1. Silent Check
export const checkWalletConnection = async (): Promise<string | null> => {
  const rawProvider = getRawProvider();
  if (!rawProvider) return null;

  try {
      const accounts = await rawProvider.request({ method: 'eth_accounts' }) as string[];
      if (accounts && accounts.length > 0) return accounts[0];
      return null;
  } catch (error: any) {
    return null;
  }
};

// 2. Manual Connect
export const connectWallet = async (): Promise<string | null> => {
  const rawProvider = getRawProvider();
  if (!rawProvider) {
       alert("Wallet not found. Please install a crypto wallet (Metamask, Rabby, etc).");
       return null;
  }

  try {
      const accounts = await rawProvider.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
          return accounts[0];
      }
      return null;
  } catch (error: any) {
    console.error("Connection error:", error);
    if (error.code === 4001) return null;
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
                const chainParams = targetChainId === LINEA_CHAIN_ID 
                    ? {
                        chainId: chainIdHex,
                        chainName: 'Linea Mainnet',
                        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://rpc.linea.build'],
                        blockExplorerUrls: ['https://lineascan.build']
                    }
                    : {
                        chainId: chainIdHex,
                        chainName: 'Base',
                        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://mainnet.base.org'],
                        blockExplorerUrls: ['https://basescan.org']
                    };
                await provider.send('wallet_addEthereumChain', [chainParams]);
            } else {
                throw switchError;
            }
        }
    } catch (e) {
        console.warn("Network switch failed:", e);
        throw e;
    }
}

// 4. Mint Identity (Base or Linea)
export const mintIdentity = async (targetChainId: number): Promise<boolean> => {
    const rawProvider = getRawProvider();
    if (!rawProvider) return false;

    try {
        const provider = new BrowserProvider(rawProvider as any);
        const signer = await provider.getSigner();
        
        await switchNetwork(provider, targetChainId);

        const contractAddress = targetChainId === LINEA_CHAIN_ID ? LINEA_CONTRACT_ADDRESS : BASE_CONTRACT_ADDRESS;
        const contract = new Contract(contractAddress, FACTORY_ABI, signer);
        
        // --- PRE-FLIGHT: CHECK BALANCE (Optional, does not block) ---
        try {
            let tokenAddress = '';
            if (targetChainId === BASE_CHAIN_ID) {
                try { tokenAddress = await contract.nft(); } catch(e) {}
            } else {
                try { tokenAddress = await contract.sbt(); } catch(e) {}
            }

            if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
                const tokenContract = new Contract(tokenAddress, ERC721_ABI, provider);
                const userAddress = await signer.getAddress();
                const balance = await tokenContract.balanceOf(userAddress);
                
                if (balance > 0n) {
                    alert("✅ You already own this Identity! Refreshing status...");
                    return true;
                }
            }
        } catch (preCheckErr) {
            console.warn("Pre-mint check skipped");
        }

        // --- ACTION: SEND TRANSACTION DIRECTLY ---
        // Removed strict staticCall simulation.
        // If the contract reverts, the wallet (MetaMask/Rabby) will show the error.
        
        try {
            const tx = await contract.mint();
            console.log(`[${targetChainId}] Identity Mint Tx Sent:`, tx.hash);
            await tx.wait();
            return true;
        } catch (txError: any) {
            console.warn("Mint Transaction Failed/Rejected:", txError);
            
            // Handle User Rejection
            if (txError.code === 4001 || txError?.info?.error?.code === 4001) {
                return false;
            }

            // Handle Contract Revert (e.g. Not Eligible)
            if (txError.code === 'CALL_EXCEPTION' || txError.code === 'UNPREDICTABLE_GAS_LIMIT') {
                alert("⚠️ Transaction Error\n\nThe contract rejected the transaction.\n\nPossible reasons:\n1. You are not eligible for this mint.\n2. The event has ended.\n3. You already own this identity.");
            } else {
                alert("Transaction failed. Please check your wallet for details.");
            }
            return false;
        }

    } catch (e: any) {
        console.error("Identity Mint System Error:", e);
        return false;
    }
}

// 5. Get Identity Status
export interface IdentityStatus {
    hasIdentity: boolean;
    balance: number;
}

export const getIdentityStatus = async (address: string, chainId: number): Promise<IdentityStatus> => {
    try {
        const rpcUrl = chainId === BASE_CHAIN_ID ? 'https://mainnet.base.org' : 'https://rpc.linea.build';
        const provider = new JsonRpcProvider(rpcUrl);
        
        const factoryAddress = chainId === LINEA_CHAIN_ID ? LINEA_CONTRACT_ADDRESS : BASE_CONTRACT_ADDRESS;
        const factoryContract = new Contract(factoryAddress, FACTORY_ABI, provider);
        
        let tokenAddress: string;
        try {
            if (chainId === BASE_CHAIN_ID) {
                tokenAddress = await factoryContract.nft();
            } else {
                tokenAddress = await factoryContract.sbt();
            }
        } catch (contractErr) {
            return { hasIdentity: false, balance: 0 };
        }

        if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
             return { hasIdentity: false, balance: 0 };
        }

        const tokenContract = new Contract(tokenAddress, ERC721_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        
        return {
            hasIdentity: Number(balance) > 0,
            balance: Number(balance)
        };
    } catch (e) {
        return { hasIdentity: false, balance: 0 };
    }
}

export const interactWithContract = async (): Promise<boolean> => {
  return mintIdentity(BASE_CHAIN_ID);
};
