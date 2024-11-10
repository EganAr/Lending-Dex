import { DEXContract } from "./contractAddresses";
import Dex_daiTokenABI from "../abi/dex/DexV4#dex_daiTokenV4.json";
import Dex_ethTokenABI from "../abi/dex/DexV4#dex_ethTokenV4.json";
import Dex_dexABI from "../abi/dex/DexV4#dexV4.json";
import Web3 from "web3";

interface TotalSupplyResult {
  0: string;
  1: string;
}

const web3 =
  typeof window !== "undefined" ? new Web3(window.ethereum) : undefined;
if (!web3) throw new Error("Please install MetaMask");

const dex_daiToken = new web3.eth.Contract(
  Dex_daiTokenABI.abi,
  DEXContract.DAIToken
);
const dex_ethToken = new web3.eth.Contract(
  Dex_ethTokenABI.abi,
  DEXContract.ETHToken
);
const dex = new web3.eth.Contract(Dex_dexABI.abi, DEXContract.DEX);

export const dex_faucetDai = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");

  try {
    await dex_daiToken.methods.faucet(from, amountInWei).send({
      from: from,
    });
  } catch (error) {
    throw error;
  }
};

export const dex_faucetEth = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");

  try {
    await dex_ethToken.methods.faucet(from, amountInWei).send({
      from: from,
    });
  } catch (error) {
    throw error;
  }
};

export const dex_approveDai = async (amount: string, from: string) => {
  try {
    await dex_daiToken.methods.approve(DEXContract.DEX, amount).send({
      from: from,
    });
  } catch (error) {
    throw error;
  }
};

export const dex_approveEth = async (amount: string, from: string) => {
  try {
    await dex_ethToken.methods.approve(DEXContract.DEX, amount).send({
      from: from,
    });
  } catch (error) {
    throw error;
  }
};

export const dex_addLiquidity = async (
  ethAmount: string,
  daiAmount: string,
  from: string
) => {
  const ethAmountInWei = web3.utils.toWei(ethAmount, "ether");
  const daiAmountInWei = web3.utils.toWei(daiAmount, "ether");
  try {
    await dex_approveEth(ethAmountInWei, from);
    await dex_approveDai(daiAmountInWei, from);
    const result = await dex.methods
      .addLiquidity(ethAmountInWei, daiAmountInWei)
      .send({ from: from });

    console.log("result", result);

    return result;
  } catch (error) {
    console.log("error", error);
  }
};

export const dex_removeLiquidity = async (lpAmount: string, from: string) => {
  const lpAmountInWei = web3.utils.toWei(lpAmount, "ether");
  const result = await dex.methods
    .removeLiquidity(lpAmountInWei)
    .send({ from: from });
  console.log("result", result);

  return result;
};

export const dex_swap = async (
  tokenIn: string,
  amountIn: string,
  minAmountOut: string,
  from: string
) => {
  const amountInWei = web3.utils.toWei(amountIn, "ether");
  const minAmountOutWei = web3.utils.toWei(minAmountOut, "ether");
  try {
    if (tokenIn === DEXContract.DAIToken) {
      await dex_approveDai(amountInWei, from);
    } else {
      await dex_approveEth(amountInWei, from);
    }
    const result = await dex.methods
      .swap(tokenIn, amountInWei, minAmountOutWei)
      .send({ from: from });

    return result;
  } catch (error) {
    console.log(error);
  }
};

export const dex_getPrice = async () => {
  const result = (await dex.methods.getPrice().call()) as TotalSupplyResult;

  const ethPrice = result[0].toString();
  const daiPrice = result[1].toString();

  const adjustedEthPrice = Number(web3.utils.fromWei(ethPrice, "ether"))
    .toFixed(2)
    .toString();
  const adjustedDaiPrice = Number(web3.utils.fromWei(daiPrice, "ether"))
    .toFixed(2)
    .toString();

  return { ethPrice: adjustedEthPrice, daiPrice: adjustedDaiPrice };
};

export const dex_walletBalanceEth = async (userAddress: string) => {
  const result: string = await dex_ethToken.methods
    .balanceOf(userAddress)
    .call();
  const adjustedEth = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedEth;
};

export const dex_walletBalanceDai = async (userAddress: string) => {
  const result: string = await dex_daiToken.methods
    .balanceOf(userAddress)
    .call();
  const adjustedDai = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedDai;
};

export const dex_getOutputLiquidity = async (
  tokenIn: string,
  amountIn: string
) => {
  const amountInWei = web3.utils.toWei(amountIn, "ether");
  const result: string = await dex.methods
    .getOutputLiquidity(tokenIn, amountInWei)
    .call();
  const adjustedOutput = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(5)
    .toString();

  return adjustedOutput;
};

export const dex_getOutputAmountOut = async (
  tokenIn: string,
  amountIn: string
) => {
  const amountInWei = web3.utils.toWei(amountIn, "ether");
  const result: string = await dex.methods
    .getOutputAmount(tokenIn, amountInWei)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(5)
    .toString();

  return adjustedResult;
};

export const dex_getLpTokensBalance = async (userAddress: string) => {
  const result: string = await dex.methods
    .getLpTokensBalance(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const dex_getTotalLpToken = async () => {
  const result: string = await dex.methods.getTotalLpTokens().call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const dex__getUserLiquidity = async (userAddress: string) => {
  const result = (await dex.methods
    .getUserLiquidity(userAddress)
    .call()) as TotalSupplyResult;

  const ethBalance = result[0].toString();
  const daiBalance = result[1].toString();

  const adjustedEth = Number(web3.utils.fromWei(ethBalance, "ether"))
    .toFixed(2)
    .toString();
  const adjustedDai = Number(web3.utils.fromWei(daiBalance, "ether"))
    .toFixed(2)
    .toString();

  return { ethBalance: adjustedEth, daiBalance: adjustedDai };
};

export const dex_getLiquidityTotalSupply = async () => {
  const result = (await dex.methods
    .getLiquidityTotalSupply()
    .call()) as TotalSupplyResult;

  const ethSupply = result[0].toString();
  const daiSupply = result[1].toString();

  const adjustedEth = Number(web3.utils.fromWei(ethSupply, "ether"))
    .toFixed(2)
    .toString();
  const adjustedDai = Number(web3.utils.fromWei(daiSupply, "ether"))
    .toFixed(2)
    .toString();

  return { totalEthSupply: adjustedEth, totalDaiSupply: adjustedDai };
};

// |__./.next
// |
// |__./hardhat
// |
// |__./node_modules
// |
// |__./public
// |
// |__./src
// |  |
// |  |__./app
// |  |__./web3
// |
