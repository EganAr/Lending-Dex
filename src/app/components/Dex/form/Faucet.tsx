"use client";

import { useCallback, useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import { useToast } from "@/hooks/use-toast";
import {
  dex_faucetDai,
  dex_faucetEth,
  dex_getPrice,
  dex_walletBalanceDai,
  dex_walletBalanceEth,
} from "@/web3";
import TokenDisplay from "../SwapComponents";
import { ArrowUpDown, Loader2 } from "lucide-react";

export default function Faucet() {
  const { account } = useWallet();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstToken: "ETH",
    secondToken: "DAI",
    firstTokenAmount: "",
    secondTokenAmount: "",
    loading: false,
    firstTokenBalance: "0",
    firstTokenPriceInUSD: "0",
    secondTokenBalance: "0",
    secondTokenPriceInUSD: "0",
  });

  const fetchBalance = useCallback(async () => {
    if (!account || account === "" || account.length !== 42) return;
    try {
      const { ethPrice, daiPrice } = await dex_getPrice();
      const BalanceEth = await dex_walletBalanceEth(account);
      const BalanceDai = await dex_walletBalanceDai(account);

      setFormData((prev) => ({
        ...prev,
        firstTokenBalance: prev.firstToken === "ETH" ? BalanceEth : BalanceDai,
        firstTokenPriceInUSD: prev.firstToken === "ETH" ? ethPrice : daiPrice,
        secondTokenBalance:
          prev.secondToken === "ETH" ? BalanceEth : BalanceDai,
        secondTokenPriceInUSD: prev.secondToken === "ETH" ? ethPrice : daiPrice,
      }));
    } catch (error) {
      console.error("Error fetching Balance:", error);
    }
  }, [account, toast]);

  useEffect(() => {
    fetchBalance();
  }, [formData.firstToken, formData.secondToken, fetchBalance]);

  useEffect(() => {
    if (formData.firstToken === "DAI") {
      setFormData((prev) => ({ ...prev, secondToken: "ETH" }));
    } else if (formData.firstToken === "ETH") {
      setFormData((prev) => ({ ...prev, secondToken: "DAI" }));
    }
  }, [formData.firstToken]);

  useEffect(() => {
    if (formData.secondToken === "DAI") {
      setFormData((prev) => ({ ...prev, firstToken: "ETH" }));
    } else if (formData.secondToken === "ETH") {
      setFormData((prev) => ({ ...prev, firstToken: "DAI" }));
    }
  }, [formData.secondToken]);

  const handleFirstInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, firstTokenAmount: value }));
    } else {
      setFormData((prev) => ({ ...prev, firstTokenAmount: "" }));
    }
  };

  const handleSecondInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, secondTokenAmount: value }));
    } else {
      setFormData((prev) => ({ ...prev, secondTokenAmount: "" }));
    }
  };

  async function handleFaucet(e: React.FormEvent) {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, loading: true }));
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        className: "bg-secondary text-red-500 ",
      });
      setFormData((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      if (formData.firstToken === "DAI") {
        await dex_faucetDai(formData.firstTokenAmount, account);
        await dex_faucetEth(formData.secondTokenAmount, account);
      } else {
        await dex_faucetEth(formData.firstTokenAmount, account);
        await dex_faucetDai(formData.secondTokenAmount, account);
      }

      await fetchBalance();
      toast({
        title: "Success!",
        description: "Your Faucet was successful.",
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
      setFormData((prev) => ({ ...prev, loading: false }));
    }
  }
  return (
    <div>
      <form
        onSubmit={handleFaucet}
        className="w-full h-[60vh] relative flex flex-col items-center gap-2"
      >
        <div className="bg-background w-full h-[30vh] flex justify-between rounded-xl p-3 font-semibold">
          <TokenDisplay
            token={formData.firstToken}
            amount={formData.firstTokenAmount}
            label="From"
            setAmount={handleFirstInput}
            setToken={(value: any) =>
              setFormData((prev) => ({ ...prev, firstToken: value }))
            }
            balance={formData.firstTokenBalance}
            priceInUSD={formData.firstTokenPriceInUSD}
          />
        </div>

        <div className="absolute top-[40%] p-1.5 bg-green-950 rounded-full">
          <ArrowUpDown size={10} />
        </div>

        <div className="bg-background w-full h-[30vh] flex justify-between rounded-xl p-3 font-semibold">
          <TokenDisplay
            token={formData.secondToken}
            amount={formData.secondTokenAmount}
            label="To"
            setAmount={handleSecondInput}
            setToken={(value: any) =>
              setFormData((prev) => ({ ...prev, secondToken: value }))
            }
            balance={formData.secondTokenBalance}
            priceInUSD={formData.secondTokenPriceInUSD}
          />
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
            {formData.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Faucet"
            )}
          </button>
        )}
      </form>
    </div>
  );
}
