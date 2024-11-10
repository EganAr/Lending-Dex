"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { getNetWorth } from "@/web3";

export default function GetNetWorth() {
  const { account } = useWallet();
  const [userNetWorth, setuserNetWorth] = useState<string>();

  useEffect(() => {
    if (!account || account === '' || account.length !== 42) return;
    const fetchNetWorth = async () => {
      try {
        const netWorth = await getNetWorth(account);

        setuserNetWorth(netWorth);
      } catch (error) {
        console.error("Error fetching net Worth:", error);
        setuserNetWorth("0");
      }
    };
    fetchNetWorth();
  }, [account, userNetWorth]);

  if (!userNetWorth || userNetWorth === "0") {
    return <p className="text-slate-500">~~</p>;
  }

  return (
    <div className="flex items-center gap-1">
      <p className="text-slate-500 text-xl font-bold">$ </p>{" "}
      <p className="text-xl text-white font-bold">{userNetWorth}</p>
    </div>
  );
}
