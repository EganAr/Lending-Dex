"use client";

import React, { useState } from "react";
import useWallet from "../../ConnectWallet";
import { faucetCollateral } from "@/web3";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function FaucetEthButton() {
  const { account } = useWallet();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Hanya mengizinkan angka dan satu titik desimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleFaucet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        className: "bg-secondary text-red-500 ",
      });
      setIsLoading(false);
      return;
    }

    try {
      await faucetCollateral(amount, account);
      setTimeout(() => {}, 1500);

      toast({
        title: "Success!",
        description: "Your Faucet ETH was successful.",
        className: "bg-secondary text-green-500 ",
      });
      setAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Transaction Failed",
        description: "Something went wrong. Please try again.",
        className: "bg-secondary text-red-500 ",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!account ? (
        <button className="bg-slate-200 text-black rounded-md px-3 py-2 text-sm opacity-50 transition-all duration-300 cursor-not-allowed">
          Faucet
        </button>
      ) : (
        <button
          onClick={toggleModal}
          className="bg-slate-200 text-black rounded-md px-3 py-2 text-sm hover:opacity-90 transition-all duration-300"
        >
          Faucet
        </button>
      )}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleModal}
      />

      <div
        className={`fixed inset-x-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   w-full max-w-sm max-h-[80vh] h-[80vh] bg-background rounded-lg p-6 shadow-xl
                   transition-all duration-300 ease-in-out
                   ${
                     isOpen
                       ? "opacity-100 scale-100"
                       : "opacity-0 scale-95 pointer-events-none"
                   }`}
      >
        <div className="flex items center justify-between">
          <h1 className="text-2xl font-bold">Faucet ETH</h1>
          <button onClick={toggleModal} className="text-2xl ">
            ✖
          </button>
        </div>

        <form
          onSubmit={handleFaucet}
          className="relative flex flex-col justify-between h-[65vh] pt-4"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-400">Amount</p>
            <div className="relative flex items-center border border-slate-700 p-4">
              <input
                type="text"
                placeholder="0.00"
                className="w-full bg-transparent rounded-sm text-white text-xl focus:outline-none "
                value={amount}
                onChange={handleInputChange}
              />
              <Image
                src={"https://app.aave.com/icons/tokens/eth.svg"}
                alt=""
                width={40}
                height={30}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className=" text-slate-400 text-sm pt-4">
                Transaction Overview
              </p>
              <div className="relative flex flex-col gap-2 border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <h1 className=" text-slate-400 text-sm ">Collaterallized</h1>✔
                </div>
                <div className="flex items-center justify-between">
                  <h1 className=" text-slate-400 text-sm ">Gas Fee</h1>
                  <p className=" text-slate-400 text-sm ">⛽ 3%</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 bg-white text-black rounded hover:opacity-90 transition-colors duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Enter an amount"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
