"use client";

import React, { useEffect, useState } from "react";
import { getDaiWalletBalance } from "@/web3";
import useWallet from "../../ConnectWallet";

export default function GetWalletBalanceDai() {
  const { account } = useWallet();
  const [walletBalance, setWalletBalance] = useState<string>();

  useEffect(() => {
    if (!account || account === "" || account.length !== 42) return;
    const fetchUserWalletBalance = async () => {
      try {
        const userWalletBalance = await getDaiWalletBalance(account);

        setWalletBalance(userWalletBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setWalletBalance("0");
      }
    };
    fetchUserWalletBalance();
  }, [account, walletBalance]);

  if (!walletBalance || walletBalance === "0") {
    return <p></p>;
  }

  return <h1 className="font-semibold">{walletBalance} DAI</h1>;
}
