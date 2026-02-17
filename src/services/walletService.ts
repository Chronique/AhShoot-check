
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
    // 1. Prioritize Window Ethereum (Standard Wallets / Desktop)
    if (typeof window !== 'undefined' && window.ethereum) {
        return window.ethereum;
    }

    // 2. Fallback to Farcaster SDK Provider (Frame Context)
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
    
    if (error.code === 4001 || error?.info?.error?.code === 4001) return null;
    
    if (error?.toString().includes("RpcResponse") || error?.name === "InternalErrorError" || error?.message?.includes("reading 'error'")) {
        alert("Wallet not detected. Please install MetaMask, Rabby, or open in Coinbase Wallet.");
        return null;
    }

    alert("Connection failed. Please unlock your wallet and try again.");
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
    const rawProvider = getRawProvider();
    if (!rawProvider) return false;

    try {
        const provider = new BrowserProvider(rawProvider as any);
        
        // 1. Force Switch Network First
        await switchNetwork(provider, targetChainId);

        // 2. Select Contract
        const contractAddress = targetChainId === LINEA_CHAIN_ID ? LINEA_CONTRACT_ADDRESS : BASE_CONTRACT_ADDRESS;
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, FACTORY_ABI, signer);
        
        // --- PRE-FLIGHT CHECK: Already Owns? ---
        // This prevents the generic "execution reverted" error if the user already has the NFT.
        try {
            let tokenAddress = '';
            if (targetChainId === BASE_CHAIN_ID) {
                try { tokenAddress = await contract.nft(); } catch(e) {}
            } else {
                try { tokenAddress = await contract.sbt(); } catch(e) {}
            }

            if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
                const tokenContract = new Contract(tokenAddress, ERC721_ABI, provider); // Use provider for read-only speed
                const userAddress = await signer.getAddress();
                const balance = await tokenContract.balanceOf(userAddress);
                
                if (balance > 0n) {
                    alert("Verification: You already hold this Identity! No need to mint again.");
                    return true; // Treat as success so UI updates
                }
            }
        } catch (preCheckErr) {
            console.warn("Pre-mint check failed (proceeding to mint anyway):", preCheckErr);
        }

        // 3. Send Transaction
        // We set a manual gasLimit to avoid 'estimateGas' failures (CALL_EXCEPTION) 
        // blocking the popup if the RPC simulation fails.
        const tx = await contract.mint({ gasLimit: 500000 });
        
        console.log(`[${targetChainId}] Identity Mint Tx Sent:`, tx.hash);
        await tx.wait();
        return true;

    } catch (e: any) {
        console.error("Identity Mint Failed:", e);
        
        if (e.code === 4001 || e?.info?.error?.code === 4001) return false;
        
        // Explain that it's likely NOT a gas (funds) issue, but a Logic issue
        if (
            e.message?.includes("execution reverted") || 
            e.info?.error?.message?.includes("execution reverted") ||
            e.code === "CALL_EXCEPTION"
        ) {
            alert("Transaction Failed: The contract rejected the transaction.\n\nThis is usually NOT because of low ETH balance (Gas), but because:\n1. The contract is paused/deprecated.\n2. Or you are not eligible.");
            return false;
        }

        if (e.message && (e.message.includes("rejected") || e.message.includes("denied"))) return false;

        alert("Transaction failed. Please check your internet connection or try again.");
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
            console.warn(`Failed to fetch token address from factory on chain ${chainId}`, contractErr);
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
        console.warn(`Failed to fetch identity status for chain ${chainId}:`, e);
        return { hasIdentity: false, balance: 0 };
    }
}

export const interactWithContract = async (): Promise<boolean> => {
  return mintIdentity(BASE_CHAIN_ID);
};
