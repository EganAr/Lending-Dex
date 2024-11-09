"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { dex_getLpTokensBalance } from "@/web3";

export default function GetUserLpTokens() {
  const [lpTokensBalance, setLpTokensBalance] = useState("");
  const { account } = useWallet();

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && account !== "" && account.length === 42) {
        try {
          const balance = await dex_getLpTokensBalance(account);
          setLpTokensBalance(balance);
        } catch (error) {
          console.error("Error fetching Balance:", error);
        }
      }
    };
    fetchBalance();
  }, [account]);

  if (!lpTokensBalance) {
    return <p className="text-slate-500 text-xl">~~</p>;
  }

  return <p className="text-xl text-white font-bold">{lpTokensBalance}</p>;
}
