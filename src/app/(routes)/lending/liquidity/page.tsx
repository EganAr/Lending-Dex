import LiquidatorDashboard from "@/app/components/Lending/LiquidatorDashboard";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";

export default function LiquidityPage() {
  return (
    <section>
      <Navbar />
      <div className="flex flex-col p-12 gap-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Image
            src={"https://app.aave.com/icons/networks/arbitrum.svg"}
            alt=""
            width={30}
            height={30}
          />
          ARBITRUM Market <p className="text-slate-500 text-sm">Sepolia ETH</p>
        </h1>
      </div>
      <div className="bg-secondary flex flex-col p-6 m-12">
        <h1 className="text-2xl font-bold">Liquidity Pools</h1>
        <LiquidatorDashboard />
      </div>
    </section>
  );
}
