import { ARBITRUM_SEPOLIA_LendingBorrowingContract } from "./contractAddresses";
import CollateralTokenABI from "../abi/lending/LendingV7#lending_CollateralTokenV7.json";
import DaiTokenABI from "../abi/lending/LendingV7#lending_DAITokenV7.json";
import PriceFeedEthABI from "../abi/lending/LendingV7#eth_usd_adapterV7.json";
import PriceFeedDaiABI from "../abi/lending/LendingV7#dai_usd_adapterV7.json";
import LendingBorrowingABI from "../abi/lending/LendingV7#lendingV7.json";
import Web3 from "web3";

interface HealthFactorResult {
  0: string;
  1: string;
  healthFactor: string;
  borrowedAmount: string;
  __length__: number;
}

const web3 = new Web3(window.ethereum);
if (!web3) throw new Error("Please install MetaMask");

const collateralToken = new web3.eth.Contract(
  CollateralTokenABI.abi,
  ARBITRUM_SEPOLIA_LendingBorrowingContract.CollateralToken
);
const daiToken = new web3.eth.Contract(
  DaiTokenABI.abi,
  ARBITRUM_SEPOLIA_LendingBorrowingContract.DAIToken
);
const priceFeedEth = new web3.eth.Contract(
  PriceFeedEthABI.abi,
  ARBITRUM_SEPOLIA_LendingBorrowingContract.PriceFeedEth
);
const priceFeedDai = new web3.eth.Contract(
  PriceFeedDaiABI.abi,
  ARBITRUM_SEPOLIA_LendingBorrowingContract.PriceFeedDai
);
const lendingBorrowing = new web3.eth.Contract(
  LendingBorrowingABI.abi,
  ARBITRUM_SEPOLIA_LendingBorrowingContract.LendingBorrowing
);

export const approveDai = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");

  try {
    await daiToken.methods
      .approve(
        ARBITRUM_SEPOLIA_LendingBorrowingContract.LendingBorrowing,
        amountInWei
      )
      .send({ from: from });
  } catch (error) {
    throw error;
  }
};

export const approveCollateral = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");

  try {
    await collateralToken.methods
      .approve(
        ARBITRUM_SEPOLIA_LendingBorrowingContract.LendingBorrowing,
        amountInWei
      )
      .send({ from: from });
  } catch (error) {
    throw error;
  }
};

export const faucetDai = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    await approveDai(amount, from);
    await daiToken.methods.faucet(from, amountInWei).send({ from: from });
  } catch (error) {
    throw error;
  }
};

export const faucetCollateral = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    await approveCollateral(amount, from);
    await collateralToken.methods
      .faucet(from, amountInWei)
      .send({ from: from });
  } catch (error) {
    throw error;
  }
};

export const deposit = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    const result = await lendingBorrowing.methods
      .deposit(amountInWei)
      .send({ from: from });
    return result;
  } catch (error) {
    throw error;
  }
};

export const withdraw = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    const result = await lendingBorrowing.methods
      .withdraw(amountInWei)
      .send({ from: from });
    return result;
  } catch (error) {
    throw error;
  }
};

export const depositCollateral = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    const result = await lendingBorrowing.methods
      .depositCollateral(amountInWei)
      .send({ from: from });
    return result;
  } catch (error) {
    throw error;
  }
};

export const redeemCollateral = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    const result = await lendingBorrowing.methods
      .redeemCollateral(amountInWei)
      .send({ from: from });
    return result;
  } catch (error) {
    throw error;
  }
};

export const borrow = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    const result = await lendingBorrowing.methods
      .borrow(amountInWei)
      .send({ from: from });
    return result;
  } catch (error) {
    throw error;
  }
};

export const repayBorrow = async (amount: string, from: string) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    const result = await lendingBorrowing.methods
      .repayBorrow(amountInWei)
      .send({ from: from });
    return result;
  } catch (error) {
    throw error;
  }
};

export const liquidate = async (
  address: string,
  amount: string,
  from: string
) => {
  const amountInWei = web3.utils.toWei(amount, "ether");
  try {
    const result = await lendingBorrowing.methods
      .liquidate(address, amountInWei)
      .send({ from: from });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getBorrowers = async () => {
  const result: string[] = await lendingBorrowing.methods.getBorrowers().call();

  return result;
};

export const getCollateralDepositors = async () => {
  return await lendingBorrowing.methods.getCollateralDepositors().call();
};

export const getHealthFactor = async (userAddress: string) => {
  const result = (await lendingBorrowing.methods
    .calculateHealthFactor(userAddress)
    .call()) as HealthFactorResult;

  const healthFactor = result[0].toString();
  const borrowedAmount = result[1].toString();

  if (borrowedAmount === "0") {
    return {
      healthFactor: "∞",
      borrowedAmount: "0",
    };
  }

  const adjustedHealthFactor = Number(web3.utils.fromWei(healthFactor, "ether"))
    .toFixed(2)
    .toString();
  const adjustedBorrowedAmount = Number(
    web3.utils.fromWei(borrowedAmount, "ether")
  )
    .toFixed(2)
    .toString();

  return {
    healthFactor: adjustedHealthFactor,
    borrowedAmount: adjustedBorrowedAmount,
  };
};

export const getNetWorth = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .calculateNetWorth(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getCollateralPrice = async () => {
  const result: string = await lendingBorrowing.methods
    .getCollateralPrice()
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getUserDeposit = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .getUserDeposit(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getTotalDeposit = async () => {
  const result: string = await lendingBorrowing.methods
    .getTotalDeposit()
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getUserCollateral = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .getUserCollateral(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  if (adjustedResult === "0") {
    return "0";
  }

  return adjustedResult;
};

export const getUserCollateralValue = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .getCollateralValue(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getUserBorrow = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .getUserBorrow(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getBorrowLimit = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .calculateAvailableBorrow(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether")).toString();

  return adjustedResult;
};

export const getUserTimeStamp = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .getUserTimeStamp(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getCollateralWalletBalance = async (userAddress: string) => {
  const result: string = await collateralToken.methods
    .balanceOf(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  if (result === "0") {
    return "0";
  }

  return adjustedResult;
};

export const getCollateralWalletBalanceValue = async (userAddress: string) => {
  const result: string = await lendingBorrowing.methods
    .getCollateralWalletValue(userAddress)
    .call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};

export const getDaiWalletBalance = async (userAddress: string) => {
  const result: string = await daiToken.methods.balanceOf(userAddress).call();
  const adjustedResult = Number(web3.utils.fromWei(result, "ether"))
    .toFixed(2)
    .toString();

  return adjustedResult;
};
