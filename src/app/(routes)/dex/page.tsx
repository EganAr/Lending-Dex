const FormDex = dynamic(() => import("@/app/components/Dex/Form"), {
  ssr: false,
});
const GetTotalLiquiditySupply = dynamic(
  () => import("@/app/components/Dex/getters/GetTotalLiquiditySupply"),
  { ssr: false }
);
const GetUserLiquidityDai = dynamic(
  () => import("@/app/components/Dex/getters/GetUserLiquidityDai"),
  { ssr: false }
);
const GetUserLiquidityEth = dynamic(
  () => import("@/app/components/Dex/getters/GetUserLiquidityEth"),
  { ssr: false }
);
const GetUserLpTokens = dynamic(
  () => import("@/app/components/Dex/getters/GetUserLpTokens"),
  { ssr: false }
);
import Navbar from "@/app/components/Navbar";
import dynamic from "next/dynamic";
import Image from "next/image";

export default function dexPage() {
  return (
    <>
      <Navbar />
      <section className="w-full h-full flex justify-center pt-6 gap-6">
        <div className="flex flex-col gap-8 w-[40vw] h-[85vh] bg-secondary rounded-xl p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-3xl font-bold">
              <Image
                src={"https://app.aave.com/icons/networks/arbitrum.svg"}
                alt=""
                width={30}
                height={30}
              />
              <h1>ARBITRUM Market </h1>
              <p className="text-slate-500 text-sm">Sepolia ETH</p>
            </div>
            <GetTotalLiquiditySupply />
          </div>

          <div className="bg-background flex flex-col justify-center gap-4 rounded-xl p-4">
            <h1 className="text-2xl font-bold">Your Supplies</h1>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <h1 className="text-slate-500 text-sm">Assets</h1>
                <div className="flex gap-3">
                  <Image
                    src={"https://app.aave.com/icons/tokens/eth.svg"}
                    alt=""
                    width={30}
                    height={30}
                  />
                  <h2 className="font-bold">ETH</h2>
                </div>
                <div className="flex gap-3">
                  <Image
                    src={"https://app.aave.com/icons/tokens/dai.svg"}
                    alt=""
                    width={30}
                    height={30}
                  />
                  <h2 className="font-bold">DAI</h2>
                </div>
                <h1 className="font-bold">LP TOKENS</h1>
              </div>
              <div className="flex flex-col items-center gap-3">
                <h2 className="text-slate-500 text-sm">Balance</h2>
                <GetUserLiquidityEth />
                <GetUserLiquidityDai />
                <GetUserLpTokens />
              </div>
            </div>
          </div>
        </div>
        <FormDex />
      </section>
    </>
  );
}
