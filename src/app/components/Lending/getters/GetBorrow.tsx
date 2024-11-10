"use client";

import React, { useEffect, useState } from "react";
import { getUserBorrow } from "@/web3";
import useWallet from "../../ConnectWallet";

export default function GetBorrow() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<string>();

  useEffect(() => {
    if (!account || account === "" || account.length !== 42) return;
    const fetchUserBorrow = async () => {
      try {
        const userDeposit = await getUserBorrow(account);
        setBalance(userDeposit);
      } catch (error) {
        console.error("Error fetching Borrow:", error);
        setBalance("0");
      }
    };
    fetchUserBorrow();
  }, [account, balance]);

  if (!balance || balance === "0") {
    return <p></p>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-semibold">{balance}</h1>
      <h1 className="text-slate-500 text-sm">$ {balance}</h1>
    </div>
  );
}
