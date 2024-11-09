"use client";

import AddLiquidity from "@/app/components/Dex/form/AddLiquidity";
import Faucet from "@/app/components/Dex/form/Faucet";
import RemoveLiquidity from "@/app/components/Dex/form/RemoveLiquidity";
import Swap from "@/app/components/Dex/form/Swap";
import { useState } from "react";

export default function FormDex() {
  const [activeTab, setActiveTab] = useState("swap");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-[50vw] h-[85vh] flex flex-col gap-3 bg-secondary rounded-xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-red-700">
          {activeTab === "swap"
            ? "Trade"
            : activeTab === "faucet"
            ? "Faucet"
            : activeTab === "Add Liquidity"
            ? "Add Liquidity"
            : "Remove Liquidity"}
        </h1>
      </div>
      <div className="flex items-center gap-3 font-semibold">
        <button
          className={
            activeTab === "swap"
              ? "bg-background text-green-500 px-4 py-2 text-sm rounded-lg"
              : "hover:bg-background hover:text-green-500 px-4 py-2 text-sm rounded-lg duration-300"
          }
          onClick={() => handleTabClick("swap")}
        >
          Swap
        </button>
        <button
          className={
            activeTab === "faucet"
              ? "bg-background text-green-500 px-4 py-2 text-sm rounded-lg"
              : "hover:bg-background hover:text-green-500 px-4 py-2 text-sm rounded-lg duration-300"
          }
          onClick={() => handleTabClick("faucet")}
        >
          Faucet
        </button>
        <button
          className={
            activeTab === "Add Liquidity"
              ? "bg-background text-green-500 px-4 py-2 text-sm rounded-lg"
              : "hover:bg-background hover:text-green-500 px-4 py-2 text-sm rounded-lg duration-300"
          }
          onClick={() => handleTabClick("Add Liquidity")}
        >
          Add Liquidity
        </button>
        <button
          className={
            activeTab === "Remove Liquidity"
              ? "bg-background text-green-500 px-4 py-2 text-sm rounded-lg"
              : "hover:bg-background hover:text-green-500 px-4 py-2 text-sm rounded-lg duration-300"
          }
          onClick={() => handleTabClick("Remove Liquidity")}
        >
          Remove Liquidity
        </button>
      </div>
      {activeTab === "swap" && <Swap />}
      {activeTab === "faucet" && <Faucet />}
      {activeTab === "Add Liquidity" && <AddLiquidity />}
      {activeTab === "Remove Liquidity" && <RemoveLiquidity />}
    </div>
  );
}
