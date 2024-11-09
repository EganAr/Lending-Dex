"use client";

import React, { useEffect, useState } from "react";
import { getUserCollateral, getUserCollateralValue } from "@/web3";
import useWallet from "../../ConnectWallet";

export default function GetCollateral() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<string>();
  const [balanceInUSD, setBalanceInUSD] = useState<string>();

  useEffect(() => {
    const fetchCollateral = async () => {
      try {
        const userBalance = await getUserCollateral(account);
        const userBalanceInUSD = await getUserCollateralValue(account);

        setBalance(userBalance);
        setBalanceInUSD(userBalanceInUSD);
      } catch (error) {
        console.error("Error fetching collateral:", error);
        setBalance("0");
      }
    };
    fetchCollateral();
  }, [account, balanceInUSD]);

  if (!balance || balance === "0") {
    return <p></p>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-semibold">{balance}</h1>
      <h1 className="text-slate-500 text-sm">$ {balanceInUSD}</h1>
    </div>
  );
}
