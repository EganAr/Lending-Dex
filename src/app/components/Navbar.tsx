"use client";

import Link from "next/link";
import useWallet from "./ConnectWallet";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { account, connectWallet } = useWallet();
  const pathname = usePathname();
  return (
    <nav className="flex items-center justify-between h-12 w-full p-4 ">
      <ul className="flex items-center gap-12 ">
        <Link href="/">
          <Image src="/img/Logo.png" alt="" width={40} height={40} />
        </Link>
        <li className="flex items-center font-semibold text-sm gap-4 ">
          {pathname === "/" ? (
            <Link
              href="/"
              className="h-12 p-4 flex items-center text-green-500 border-b border-button py-2 transition-all duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/"
              className="h-12 p-4 flex items-center hover:text-green-500 hover:border-b hover:border-button hover:py-2 transition-all duration-300"
            >
              Dashboard
            </Link>
          )}
          {pathname === "/lending/liquidity" ? (
            <Link
              href="/lending/market"
              className="h-12 p-4 flex items-center text-green-500 border-b border-button hover:py-2 transition-all duration-300"
            >
              Liquidity Pools
            </Link>
          ) : (
            <Link
              href="/lending/liquidity"
              className="h-12 p-4 flex items-center hover:text-green-500 hover:border-b hover:border-button hover:py-2 transition-all duration-300"
            >
              Liquidity Pools
            </Link>
          )}
          {pathname === "/lending/fundAndFaucet" ? (
            <Link
              href="/lending/fundAndFaucet"
              className="h-12 p-4 flex items-center text-green-500 border-b border-button transition-all duration-300"
            >
              Funding & Faucets
            </Link>
          ) : (
            <Link
              href="/lending/fundAndFaucet"
              className="h-12 p-4 text-sm flex items-center hover:text-green-500 hover:border-b hover:border-button hover:py-2 transition-all duration-300"
            >
              Funding & Faucets
            </Link>
          )}
          {pathname === "/dex" ? (
            <Link
              href="/dex"
              className="h-12 p-4 flex items-center text-green-500 border-b border-button transition-all duration-300"
            >
              Swap Token
            </Link>
          ) : (
            <Link
              href="/dex"
              className="h-12 p-4 text-sm flex items-center hover:text-green-500 hover:border-b hover:border-button hover:py-2 transition-all duration-300"
            >
              Swap Token
            </Link>
          )}
        </li>
      </ul>

      <ul className="flex items-center gap-4 w-32 h-10">
        {account ? (
          <div className="bg-secondary w-32 p-1.5 flex items-center">
            <p className="text-sm overflow-hidden text-ellipsis px-2">
              {account}
            </p>
          </div>
        ) : (
          <button
            className="bg-secondary w-32 p-1.5 text-sm"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </ul>
    </nav>
  );
}
