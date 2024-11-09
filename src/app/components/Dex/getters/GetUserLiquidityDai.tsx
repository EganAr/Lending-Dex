"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { dex__getUserLiquidity } from "@/web3";

export default function GetUserLiquidityDai() {
  const { account } = useWallet();
  const [userDaiBalance, setUserDaiBalance] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && account !== "" && account.length === 42) {
        try {
          const { daiBalance } = await dex__getUserLiquidity(account);
          setUserDaiBalance(daiBalance);
        } catch (error) {
          console.error("Error fetching Balance:", error);
        }
      }
    };
    fetchBalance();
  }, [account]);

  if (!userDaiBalance) {
    return <p className="text-slate-500 text-xl">~~</p>;
  }

  return <p className="text-xl text-white font-bold">{userDaiBalance}</p>;
}
