"use client";

import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { getCollateralPrice } from "@/web3";

export default function GetPrice() {
  const { account } = useWallet();
  const [price, setPrice] = useState<string>();

  useEffect(() => {
    const fetchCollateralPrice = async () => {
      if (account && account !== "" && account.length === 42) {
        try {
          const price = await getCollateralPrice();
          setPrice(price);
        } catch (error) {
          console.error("Error fetching Price:", error);
          setPrice("0");
        }
      }
    };
    fetchCollateralPrice();
  }, [account, price]);

  return <p className="text-slate-500 text-sm">$ {price}</p>;
}
