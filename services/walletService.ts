
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { BASE_CHAIN_ID, TARGET_CONTRACT_ADDRESS, CONTRACT_ABI } from '../src/constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// 1. Silent Check (Auto-connect logic)
// Checks if the wallet is already authorized without triggering a popup.
// Ideal for Farcaster/Coinbase Wallet returning users.
export const checkWalletConnection = async (): Promise<string | null> => {
  if (!window.ethereum) return null;

  try {
    const provider = new BrowserProvider(window.ethereum);
    // eth_accounts returns the array of authorized accounts immediately
    const accounts = await provider.send("eth_accounts", []);
    
    if (accounts.length > 0) {
      // If we found an account, ensure we are on the right chain
      await switchNetwork(provider);
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error("Silent connection check failed:", error);
    return null;
  }
};

// 2. Manual Connect (Button Click)
// Triggers the wallet popup (Metamask, Rabby, etc.)
export const connectWallet = async (): Promise<string | null> => {
  if (!window.ethereum) {
    alert("Wallet not found. Please install Rabby, MetaMask, or open in Coinbase Wallet.");
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    // eth_requestAccounts triggers the popup
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
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // 8453 in hex
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
             // Optional: Add logic to add chain, but Base is usually default in most wallets now.
             alert("Please switch your wallet to Base Network.");
        }
        throw switchError;
      }
    }
}

export const interactWithContract = async (): Promise<boolean> => {
  if (!window.ethereum) return false;

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const contract = new Contract(TARGET_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    // Call the attest function
    const tx = await contract.attest();

    console.log("Transaction sent:", tx.hash);
    await tx.wait(); // Wait for confirmation
    return true;
  } catch (error: any) {
    console.error("Interaction failed:", error);
    // User rejected transaction
    if (error.code === 4001 || error?.info?.error?.code === 4001) {
        return false;
    }
    alert("Transaction failed. Please ensure you have enough ETH on Base for gas.");
    return false;
  }
};
