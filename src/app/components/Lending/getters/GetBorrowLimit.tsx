"use client";

import React, { useEffect, useState } from "react";
import { getBorrowLimit } from "@/web3";
import useWallet from "../../ConnectWallet";

export default function GetBorrowLimit() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<string>();

  useEffect(() => {
    const fetchBorrowLimit = async () => {
      try {
        const userBorrow = await getBorrowLimit(account);
        setBalance(userBorrow);
      } catch (error) {
        console.error("Error fetching BorrowLimit:", error);
        setBalance("0");
      }
    };
    fetchBorrowLimit();
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
