"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { dex_getLiquidityTotalSupply } from "@/web3/contracts/dex";

export default function GetTotalLiquiditySupply() {
  const { account } = useWallet();
  const [ethSupply, setEthSupply] = useState("");
  const [daiSupply, setDaiSupply] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && account !== "" && account.length === 42) {
        try {
          const { totalEthSupply, totalDaiSupply } =
            await dex_getLiquidityTotalSupply();

          setEthSupply(totalEthSupply);
          setDaiSupply(totalDaiSupply);
        } catch (error) {
          console.error("Error fetching Supply:", error);
        }
      }
    };
    fetchBalance();
  }, [account]);

  return (
    <div className="flex items-center gap-6 text-lg ">
      <div className="flex flex-col items-center">
        <h1 className="text-slate-500">ETH Liquidity</h1>
        <h2 className="text-lg font-bold">{ethSupply ? ethSupply : "~~"}</h2>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-slate-500">DAI Liquidity</h1>
        <h2 className="text-lg font-bold">{daiSupply ? daiSupply : "~~"}</h2>
      </div>
    </div>
  );
}
