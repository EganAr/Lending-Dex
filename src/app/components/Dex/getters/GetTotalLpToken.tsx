"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { dex_getTotalLpToken } from "@/web3";

export default function GetTotalLpToken() {
  const { account } = useWallet();
  const [totalBalance, setTotalBalance] = useState<string>();

  useEffect(() => {
    const fetchDeposit = async () => {
      if (account && account !== "" && account.length === 42) {
        try {
          const totalToken = await dex_getTotalLpToken();
          setTotalBalance(totalToken);
        } catch (error) {
          console.error("Error fetching Deposit:", error);
          setTotalBalance("0");
        }
      }
    };
    fetchDeposit();
  }, [account]);

  if (!totalBalance) {
    return <p className="text-slate-500 text-xl">~~</p>;
  }

  return <p className="text-xl text-white font-bold">{totalBalance}</p>;
}
