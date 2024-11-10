"use client";

import { connectWallet } from "../../web3/config/config";
import React, { createContext, useContext, useState } from "react";

type WalletContextProps = {
  account: string;
  connectWallet: () => Promise<string | null>;
};

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [account, setAccount] = useState<string>("");

  const handleConnectWallet = async () => {
    const connectedAccount = await connectWallet();

    if (connectedAccount) {
      setAccount(connectedAccount);
    }

    return connectedAccount;
  };

  return (
    <WalletContext.Provider
      value={{ account, connectWallet: handleConnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default function useWallet() {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
