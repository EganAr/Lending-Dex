"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { getHealthFactor } from "@/web3";

export default function GetHealthFactor() {
  const { account } = useWallet();
  const [userHealthFactor, setUserHealthFactor] = useState<string>();

  useEffect(() => {
    if (!account || account === '' || account.length !== 42) return;
    const fetchHealthFactor = async () => {
      try {
        const { healthFactor } = await getHealthFactor(account);

        setUserHealthFactor(healthFactor);
      } catch (error) {
        console.error("Error fetching health factor:", error);
        setUserHealthFactor("0");
      }
    };
    fetchHealthFactor();
  }, [account, userHealthFactor]);

  if (!userHealthFactor || userHealthFactor === "0") {
    return <p className="text-slate-500">~~</p>;
  }

  return <p>{userHealthFactor}</p>;
}
