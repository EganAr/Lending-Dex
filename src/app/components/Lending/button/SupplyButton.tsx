"use client";

import React, { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { depositCollateral, getCollateralWalletBalance } from "@/web3";
import Image from "next/image";
import GetHealthFactor from "../getters/GetHealthFactor";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SupplyButton() {
  const { account } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (account && account !== "" && account.length === 42) {
        try {
          const userWalletBalance = await getCollateralWalletBalance(account);

          setWalletBalance(userWalletBalance);
        } catch (error) {
          console.error("Error fetching collateral:", error);
          setWalletBalance("0");
        }
      }
    };
    fetchWalletBalance();
  }, [account, handleDeposit]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const formatAmount = (value: number): string => {
    return value.toFixed(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Hanya mengizinkan angka dan satu titik desimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value || "0");
      const maxValue = parseFloat(walletBalance);

      if (numValue > maxValue) {
        setAmount(formatAmount(maxValue));
      } else {
        setAmount(value);
      }
    }
  };

  async function handleDeposit(e: React.FormEvent) {
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
      await depositCollateral(amount.toString(), account);
      setTimeout(() => {}, 1500);

      toast({
        title: "Success!",
        description: "Your Supply was successful.",
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
  }

  return (
    <div>
      {!account ? (
        <button className="bg-slate-200 text-black rounded-md px-5 py-2 text-sm opacity-50 transition-all duration-300 cursor-not-allowed">
          Supply
        </button>
      ) : (
        <button
          onClick={toggleModal}
          className="bg-slate-200 text-black rounded-md px-5 py-2 text-sm hover:opacity-90 transition-all duration-300"
        >
          Supply
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
          <h1 className="text-2xl font-bold">Supply ETH</h1>
          <button onClick={toggleModal} className="text-2xl ">
            ✖
          </button>
        </div>

        <form
          onSubmit={handleDeposit}
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
                <div className="flex items-center justify-between ">
                  <h1 className=" text-slate-400 text-sm ">Wallet Balance</h1>
                  {walletBalance} ETH
                </div>
                <div className="flex items-center justify-between text-green-400">
                  <h1 className=" text-slate-400 text-sm ">Health Factor</h1>
                  <GetHealthFactor />
                </div>
                <div className="flex items-center justify-between">
                  <h1 className=" text-slate-400 text-sm ">
                    Collaterallization
                  </h1>
                  ✔
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
