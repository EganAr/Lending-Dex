"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { getTotalDeposit } from "@/web3";

export default function GetTotalDeposit() {
  const { account } = useWallet();
  const [totalDeposited, setTotalDeposited] = useState<string>();

  useEffect(() => {
    const fetchDeposited = async () => {
      try {
        const totalDai = await getTotalDeposit();

        setTotalDeposited(totalDai);
      } catch (error) {
        console.error("Error fetching deposited:", error);
        setTotalDeposited("0");
      }
    };
    fetchDeposited();
  }, [account, totalDeposited]);

  if (!totalDeposited || totalDeposited === "0") {
    return <p className="text-slate-500">~~</p>;
  }

  return <p className="flex items-center gap-1">$ {totalDeposited}</p>;
}
