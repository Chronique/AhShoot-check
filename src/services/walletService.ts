
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
    // If window.ethereum is available, use it. This prevents the SDK provider 
    // from throwing errors when running in a standard browser environment.
    if (typeof window !== 'undefined' && window.ethereum) {
        return window.ethereum;
    }

    // 2. Fallback to Farcaster SDK Provider (Frame Context)
    // Only use this if we are likely in a Farcaster context or if window.ethereum is missing
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
      // Use raw request to avoid Ethers network detection issues on locked wallets
      const accounts = await rawProvider.request({ method: 'eth_accounts' }) as string[];
      if (accounts && accounts.length > 0) return accounts[0];
      return null;
  } catch (error: any) {
    // Suppress errors during silent check to avoid console noise on Web
    // specifically "RpcResponse.InternalErrorError" from Farcaster SDK
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
      // Use raw request to trigger popup directly. 
      // This avoids "could not coalesce error" from Ethers v6 when wallet is locked.
      const accounts = await rawProvider.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
          return accounts[0];
      }
      return null;
  } catch (error: any) {
    console.error("Connection error:", error);
    
    // User rejected request
    if (error.code === 4001 || error?.info?.error?.code === 4001) return null;
    
    // Catch Farcaster SDK failure on Web (RpcResponse.InternalErrorError)
    // This happens when falling back to SDK provider on a standard browser without parent frame
    if (error?.toString().includes("RpcResponse") || error?.name === "InternalErrorError" || error?.message?.includes("reading 'error'")) {
        alert("Wallet not detected. Please install MetaMask, Rabby, or open in Coinbase Wallet.");
        return null;
    }

    // Fallback error message
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
        // Create provider only when needed for interaction
        const provider = new BrowserProvider(rawProvider as any);
        
        // 1. Force Switch Network First
        await switchNetwork(provider, targetChainId);

        // 2. Select Contract Address based on Chain (The Factory Address)
        const contractAddress = targetChainId === LINEA_CHAIN_ID ? LINEA_CONTRACT_ADDRESS : BASE_CONTRACT_ADDRESS;

        const signer = await provider.getSigner();
        // Use FACTORY_ABI to call mint()
        const contract = new Contract(contractAddress, FACTORY_ABI, signer);
        
        // 3. Send Transaction
        const tx = await contract.mint();
        
        console.log(`[${targetChainId}] Identity Mint Tx Sent:`, tx.hash);
        await tx.wait();
        return true;

    } catch (e: any) {
        console.error("Identity Mint Failed:", e);
        
        if (e.code === 4001 || e?.info?.error?.code === 4001) return false;
        
        // Check for common error strings
        if (e.message && (e.message.includes("rejected") || e.message.includes("denied"))) return false;

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
        // Use JsonRpcProvider for reliable read-only calls independent of the user's wallet connection
        const rpcUrl = chainId === BASE_CHAIN_ID ? 'https://mainnet.base.org' : 'https://rpc.linea.build';
        const provider = new JsonRpcProvider(rpcUrl);
        
        // 1. Get Factory Contract
        const factoryAddress = chainId === LINEA_CHAIN_ID ? LINEA_CONTRACT_ADDRESS : BASE_CONTRACT_ADDRESS;
        const factoryContract = new Contract(factoryAddress, FACTORY_ABI, provider);
        
        // 2. Fetch the actual Token Address from the Factory
        // Base Factory has 'nft()', Linea Factory has 'sbt()'
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
             // Token contract not set on factory yet
             return { hasIdentity: false, balance: 0 };
        }

        // 3. Check Balance on the Token Contract
        const tokenContract = new Contract(tokenAddress, ERC721_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        
        return {
            hasIdentity: Number(balance) > 0,
            balance: Number(balance)
        };
    } catch (e) {
        // Silent failure for read-only checks (network errors, etc.)
        console.warn(`Failed to fetch identity status for chain ${chainId}:`, e);
        return { hasIdentity: false, balance: 0 };
    }
}

export const interactWithContract = async (): Promise<boolean> => {
  return mintIdentity(BASE_CHAIN_ID);
};
