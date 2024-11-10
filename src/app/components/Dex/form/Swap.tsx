"use client";

import { useCallback, useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import {
  dex_getOutputAmountOut,
  dex_getPrice,
  dex_swap,
  dex_walletBalanceDai,
  dex_walletBalanceEth,
} from "@/web3/contracts/dex";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import TokenDisplay, { TOKEN } from "../SwapComponents";

export default function Swap() {
  const [formData, setFormData] = useState({
    tokenIn: "ETH",
    tokenOut: "DAI",
    amountIn: "",
    amountOut: "",
    loading: false,
    tokenInBalance: "0",
    tokenInPriceInUSD: "0",
    tokenOutBalance: "0",
    tokenOutPriceInUSD: "0",
  });
  const [ethBalance, setEthBalance] = useState("");
  const [daiBalance, setDaiBalance] = useState("");
  const { account } = useWallet();
  const { toast } = useToast();

  const fetchBalance = useCallback(async () => {
    if (!account || account === "" || account.length !== 42) return;
    try {
      const { ethPrice, daiPrice } = await dex_getPrice();
      const BalanceEth = await dex_walletBalanceEth(account);
      const BalanceDai = await dex_walletBalanceDai(account);

      setEthBalance(BalanceEth);
      setDaiBalance(BalanceDai);
      setFormData((prev) => ({
        ...prev,
        tokenInBalance: prev.tokenIn === "ETH" ? BalanceEth : BalanceDai,
        tokenInPriceInUSD: prev.tokenIn === "ETH" ? ethPrice : daiPrice,
        tokenOutBalance: prev.tokenOut === "ETH" ? BalanceEth : BalanceDai,
        tokenOutPriceInUSD: prev.tokenOut === "ETH" ? ethPrice : daiPrice,
      }));
    } catch (error) {
      console.error("Error fetching Balance:", error);
    }
  }, [account]);

  useEffect(() => {
    fetchBalance();
  }, [formData.tokenIn, formData.tokenOut, fetchBalance]);

  useEffect(() => {
    if (formData.amountIn === "" || formData.amountIn === "0") return;
    const fetchOutputAmount = async () => {
      try {
        const outputAmount = await dex_getOutputAmountOut(
          TOKEN[formData.tokenIn as keyof typeof TOKEN].address,
          formData.amountIn
        );
        setFormData((prev) => ({ ...prev, amountOut: outputAmount }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchOutputAmount();
  }, [formData.amountIn, formData.tokenIn]);

  useEffect(() => {
    if (formData.tokenIn === "") return;

    if (formData.tokenIn === "DAI") {
      setFormData((prev) => ({ ...prev, tokenOut: "ETH" }));
    } else if (formData.tokenIn === "ETH") {
      setFormData((prev) => ({ ...prev, tokenOut: "DAI" }));
    }
  }, [formData.tokenIn]);

  const formatAmount = (value: number): string => {
    return value.toFixed(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value || "0");
    const { tokenIn } = formData;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const maxBalance =
        tokenIn === "DAI" ? parseFloat(daiBalance) : parseFloat(ethBalance);
      if (numValue > maxBalance) {
        setFormData((prev) => ({
          ...prev,
          amountIn: formatAmount(maxBalance),
        }));
      } else {
        setFormData((prev) => ({ ...prev, amountIn: value }));
      }
    }
  };

  async function handleSwap(e: React.FormEvent) {
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
      await dex_swap(
        TOKEN[formData.tokenIn as keyof typeof TOKEN].address,
        formData.amountIn.toString(),
        formData.amountOut.toString(),
        account
      );
      await fetchBalance();

      toast({
        title: "Success!",
        description: "Your Swap was successful.",
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
        onSubmit={handleSwap}
        className="w-full h-[60vh] relative flex flex-col items-center gap-2"
      >
        <div className="bg-background w-full h-[30vh] flex justify-between rounded-xl p-3 font-semibold">
          <TokenDisplay
            token={formData.tokenIn}
            amount={formData.amountIn}
            label="From"
            setAmount={handleInputChange}
            balance={formData.tokenInBalance}
            priceInUSD={formData.tokenInPriceInUSD}
            setToken={(value: any) =>
              setFormData((prev) => ({ ...prev, tokenIn: value }))
            }
          />
        </div>

        <div className="absolute top-[40%] p-1.5 bg-green-950 rounded-full">
          <ArrowUpDown size={10} />
        </div>

        <div className="bg-background w-full h-[30vh] flex justify-between rounded-xl p-3 font-semibold">
          <TokenDisplay
            token={formData.tokenOut}
            amount={formData.amountOut}
            label="To (Estimated)"
            isOutput={true}
            balance={formData.tokenOutBalance}
            priceInUSD={formData.tokenOutPriceInUSD}
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
              "Swap"
            )}
          </button>
        )}
      </form>
    </div>
  );
}
