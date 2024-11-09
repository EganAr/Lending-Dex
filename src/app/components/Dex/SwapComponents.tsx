"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEXContract } from "@/web3";
import { Wallet } from "lucide-react";

export const TOKEN: {
  [key: string]: { address: string; symbol: string; icon: string };
} = {
  DAI: {
    address: DEXContract.DAIToken,
    symbol: "DAI",
    icon: "https://app.aave.com/icons/tokens/dai.svg",
  },
  ETH: {
    address: DEXContract.ETHToken,
    symbol: "ETH",
    icon: "https://app.aave.com/icons/tokens/eth.svg",
  },
};

function TokenOption({ token }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={token.icon}
          alt={token.symbol}
          className="w-full h-full object-contain"
        />
      </div>
      <span className="font-medium">{token.symbol}</span>
    </div>
  );
}

export default function TokenDisplay({
  token,
  amount,
  label,
  isOutput = false,
  setAmount,
  balance,
  priceInUSD,
  setToken,
}: any) {
  return (
    <div className="flex flex-col justify-between w-full h-full">
      <label className="text-sm font-medium">{label}</label>
      <div className="w-full flex justify-between items-center">
        <input
          type="text"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e)}
          className="text-4xl text-white w-full bg-transparent rounded-sm focus:outline-none"
          disabled={isOutput}
        />
        <Select
          value={token}
          onValueChange={(value) => setToken(value)}
          disabled={isOutput}
        >
          <SelectTrigger className="bg-secondary rounded-lg text-lg w-36 h-10 px-2 cursor-pointer">
            <SelectValue
              placeholder={
                <div className="text-muted-foreground text-sm">
                  Select token
                </div>
              }
            >
              {token ? <TokenOption token={TOKEN[token]} /> : "Select token"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-secondary rounded-lg w-32 px-2 cursor-pointer">
            {Object.entries(TOKEN).map(([key, tokenData]) => (
              <SelectItem
                key={key}
                value={key}
                className="cursor-pointer hover:opacity-90"
              >
                <TokenOption token={tokenData} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between ">
        <h1>${priceInUSD}</h1>
        <div className="flex items-center  gap-2 text-2xl">
          <Wallet size={20} />
          <h1>{balance}</h1>
        </div>
      </div>
    </div>
  );
}
