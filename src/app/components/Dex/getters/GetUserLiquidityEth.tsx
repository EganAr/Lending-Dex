"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { dex__getUserLiquidity } from "@/web3";

export default function GetUserLiquidityEth() {
  const { account } = useWallet();
  const [userEthBalance, setUserEthBalance] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && account !== "" && account.length === 42) {
        try {
          const { ethBalance } = await dex__getUserLiquidity(
            account
          );
          setUserEthBalance(ethBalance);
        } catch (error) {
          console.error("Error fetching Balance:", error);
        }
      }
    };
    fetchBalance();
  }, [account]);

  if (!userEthBalance) {
    return <p className="text-slate-500 text-xl">~~</p>;
  }

  return <p className="text-xl text-white font-bold">{userEthBalance}</p>;
}
