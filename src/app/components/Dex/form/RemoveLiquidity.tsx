"use client";

import { dex_getLpTokensBalance, dex_removeLiquidity } from "@/web3";
import { useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wallet } from "lucide-react";

export default function RemoveLiquidity() {
  const [lpTokensBalance, setLpTokensBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await dex_getLpTokensBalance(account);
        setLpTokensBalance(balance);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBalance();
  }, [account, handleRemoveLiquidity]);

  const formatAmount = (value: number): string => {
    return value.toFixed(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value || "0");
    const maxValue = parseFloat(lpTokensBalance);

    // Hanya mengizinkan angka dan satu titik desimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      if (numValue > maxValue) {
        setAmount(formatAmount(maxValue));
      } else {
        setAmount(value);
      }
    }
  };

  async function handleRemoveLiquidity(e: React.FormEvent) {
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
      await dex_removeLiquidity(amount, account);
      toast({
        title: "Success!",
        description: "Your Remove Liquidity was successful.",
        className: "bg-secondary text-green-500 ",
      });
    } catch (error) {
      console.log(error);
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
      <form
        onSubmit={handleRemoveLiquidity}
        className="w-full h-[60vh] relative flex flex-col items-center gap-2"
      >
        <div className="bg-background w-full h-[30vh] flex flex-col justify-between rounded-xl p-3 font-semibold">
          <label className="text-sm font-medium">Lp Tokens</label>
          <input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleInputChange(e)}
            className="text-4xl text-white w-full bg-transparent rounded-sm focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <h1></h1>
            <div className="flex items-center  gap-2 text-2xl">
              <Wallet size={20} />
              <h1>{lpTokensBalance}</h1>
            </div>
          </div>
        </div>
        {!account ? (
          <p className="flex items-center justify-center opacity-50 bg-green-800 w-full h-[8vh] rounded-xl text-xl font-bold hover:bg-green-950 duration-300 cursor-not-allowed">
            Connect Wallet
          </p>
        ) : (
          <button
            type="submit"
            className="flex items-center justify-center bg-green-800 w-full h-[8vh] rounded-xl text-xl font-bold hover:bg-green-950 duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Remove Liquidity"
            )}
          </button>
        )}
      </form>
    </div>
  );
}
