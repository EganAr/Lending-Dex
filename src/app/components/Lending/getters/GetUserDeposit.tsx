"use client";

import React, { useEffect, useState } from "react";
import { getUserDeposit } from "@/web3";
import useWallet from "../../ConnectWallet";

export default function GetUserDeposit() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<string>();

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const userDeposit = await getUserDeposit(account);
        setBalance(userDeposit);
      } catch (error) {
        console.error("Error fetching user Deposited:", error);
        setBalance("0");
      }
    };
    fetchDeposit();
  }, [account, balance]);

  if (!balance || balance === "0") {
    return <p></p>;
  }

  return <h1 className="font-semibold">{balance} DAI</h1>;
}
