import Web3 from "web3";
import { MetaMaskProvider } from "web3";
declare global {
  interface Window {
    ethereum: MetaMaskProvider<any>;
  }
}

let web3!: Web3;
const ARBITRUM_SEPOLIA_RPC =
  process.env.ARBITRUM_SEPOLIA_RPC_URL ||
  "https://arb-sepolia.g.alchemy.com/v2/PaY5Zaa0PWDYxtxrtvoPnwZWUuOVgizC";

export const ARBITRUM_SEPOLIA_CONFIG = {
  chainId: "0x66eee",
  chainName: "Arbitrum Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [ARBITRUM_SEPOLIA_RPC],
  blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
};

export const getWeb3Instance = () => {
  if (!web3) {
    throw new Error("Web3 not initialized");
  }
  return web3;
};

export const initWeb3 = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Please install MetaMask");
  }

  try {
    web3 = new Web3(window.ethereum);
    const chainId = (await web3.eth.getChainId()).toString();
    console.log("chainId", chainId);

    if (chainId !== "421614") {
      console.error(`Unsupported chain ID: ${chainId}`);
      throw new Error("Please switch to Arbitrum Sepolia network");
    }
    return web3;
  } catch (error) {
    console.error("Error initializing Web3", error);
    throw error;
  }
};

export const switchToArbitrumSepolia = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARBITRUM_SEPOLIA_CONFIG.chainId }],
    });
  } catch (switchError: any) {
    // Chain belum ada di MetaMask
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [ARBITRUM_SEPOLIA_CONFIG],
      });
    } else {
      throw switchError;
    }
  }
};

export const connectWallet = async () => {
  try {
    await switchToArbitrumSepolia();
    const web3 = await initWeb3();

    if (!web3) {
      throw new Error("Web3 not initialized");
    }
    const accounts = await web3.eth.requestAccounts();

    return accounts[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default web3;
