"use client";

import { useCallback, useEffect, useState } from "react";
import useWallet from "../../ConnectWallet";
import {
  dex_addLiquidity,
  dex_getOutputLiquidity,
  dex_getPrice,
  dex_walletBalanceDai,
  dex_walletBalanceEth,
} from "@/web3/contracts/dex";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TokenDisplay, { TOKEN } from "../SwapComponents";

export default function AddLiquidity() {
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
        firstTokenBalance: prev.firstToken === "ETH" ? BalanceEth : BalanceDai,
        firstTokenPriceInUSD: prev.firstToken === "ETH" ? ethPrice : daiPrice,
        secondTokenBalance:
          prev.secondToken === "ETH" ? BalanceEth : BalanceDai,
        secondTokenPriceInUSD: prev.secondToken === "ETH" ? ethPrice : daiPrice,
      }));
    } catch (error) {
      console.error("Error fetching Balance:", error);
    }
  }, [account]);

  useEffect(() => {
    fetchBalance();
  }, [formData.firstToken, formData.secondToken, fetchBalance]);

  useEffect(() => {
    if (!formData.firstTokenAmount || formData.firstTokenAmount === "") return;
    const fetchOutputAmount = async () => {
      try {
        const outputAmount = await dex_getOutputLiquidity(
          TOKEN[formData.firstToken as keyof typeof TOKEN].address,
          formData.firstTokenAmount
        );
        setFormData((prev) => ({ ...prev, secondTokenAmount: outputAmount }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchOutputAmount();
  }, [formData.firstTokenAmount, formData.firstToken]);

  useEffect(() => {
    if (formData.firstToken === "DAI") {
      setFormData((prev) => ({ ...prev, secondToken: "ETH" }));
    } else if (formData.firstToken === "ETH") {
      setFormData((prev) => ({ ...prev, secondToken: "DAI" }));
    }
  }, [formData.firstToken]);

  const formatAmount = (value: number): string => {
    return value.toFixed(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value || "0");
    const { firstToken } = formData;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const maxBalance =
        firstToken === "DAI" ? parseFloat(daiBalance) : parseFloat(ethBalance);
      if (numValue > maxBalance) {
        setFormData((prev) => ({
          ...prev,
          firstTokenAmount: formatAmount(maxBalance),
        }));
      } else {
        setFormData((prev) => ({ ...prev, firstTokenAmount: value }));
      }
    }
  };

  async function handleAddLiquidity(e: React.FormEvent) {
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
        await dex_addLiquidity(
          formData.secondTokenAmount,
          formData.firstTokenAmount,
          account
        );
      } else {
        await dex_addLiquidity(
          formData.firstTokenAmount,
          formData.secondTokenAmount,
          account
        );
      }
      await fetchBalance();
      toast({
        title: "Success!",
        description: "Your Add Liquidity was successful.",
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
        onSubmit={handleAddLiquidity}
        className="w-full h-[60vh] relative flex flex-col items-center gap-2"
      >
        <div className="bg-background w-full h-[30vh] flex justify-between rounded-xl p-3 font-semibold">
          <TokenDisplay
            token={formData.firstToken}
            amount={formData.firstTokenAmount}
            label="From"
            setAmount={handleInputChange}
            balance={formData.firstTokenBalance}
            priceInUSD={formData.firstTokenPriceInUSD}
            setToken={(value: any) =>
              setFormData((prev) => ({ ...prev, firstToken: value }))
            }
          />
        </div>

        <div className="absolute top-[40%] p-1.5 bg-green-950 rounded-full">
          <ArrowUpDown size={10} />
        </div>

        <div className="bg-background w-full h-[30vh] flex justify-between rounded-xl p-3 font-semibold">
          <TokenDisplay
            token={formData.secondToken}
            amount={formData.secondTokenAmount}
            label="To (Estimated)"
            isOutput={true}
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
              "Add Liquidity"
            )}
          </button>
        )}
      </form>
    </div>
  );
}
