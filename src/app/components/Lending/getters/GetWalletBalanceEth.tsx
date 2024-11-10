"use client";

import React, { useEffect, useState } from "react";
import {
  getCollateralWalletBalance,
  getCollateralWalletBalanceValue,
} from "@/web3";
import useWallet from "../../ConnectWallet";

export default function GetWalletBalanceEth() {
  const { account } = useWallet();
  const [walletBalance, setWalletBalance] = useState<string>();
  const [walletBalanceInUSD, setWalletBalanceInUSD] = useState<string>();

  useEffect(() => {
    if (!account || account === "" || account.length !== 42) return;
    const fetchWalletBalance = async () => {
      try {
        const userWalletBalance = await getCollateralWalletBalance(account);
        const userWalletBalanceInUSD = await getCollateralWalletBalanceValue(
          account
        );

        setWalletBalance(userWalletBalance);
        setWalletBalanceInUSD(userWalletBalanceInUSD);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance("0");
      }
    };
    fetchWalletBalance();
  }, [account, walletBalanceInUSD]);

  if (!walletBalance || walletBalance === "0") {
    return <p></p>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-semibold">{walletBalance}</h1>
      <h1 className="text-slate-500 text-sm">$ {walletBalanceInUSD}</h1>
    </div>
  );
}
