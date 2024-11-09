import FaucetDaiButton from "@/app/components/Lending/button/FaucetDaiButton";
import FaucetEthButton from "@/app/components/Lending/button/FaucetEthButton";
import FundingButton from "@/app/components/Lending/button/FundingButton";
import WithdrawFundButton from "@/app/components/Lending/button/WithdrawFundButton";
import GetNetWorth from "@/app/components/Lending/getters/GetNetWorth";
import GetTotalDeposit from "@/app/components/Lending/getters/GetTotalDeposit";
import GetUserDeposit from "@/app/components/Lending/getters/GetUserDeposit";
import GetWalletBalanceDai from "@/app/components/Lending/getters/GetWalletBalanceDai";
import GetWalletBalanceEth from "@/app/components/Lending/getters/GetWalletBalanceEth";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";

export default function FundAndFaucetPage() {
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
        <div className="flex items-center gap-6 text-lg ">
          <div className="flex flex-col items-center">
            <h1 className="text-slate-500">Net Worth</h1>
            <GetNetWorth />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-slate-500">DAI Liquidity</h1>
            <h2 className="text-lg font-bold">
              <GetTotalDeposit />
            </h2>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-slate-500">Interest Rate </h1>
            <p className="text-green-500 text-lg font-bold">5%</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-5 p-5">
        <div className="h-[25vh] w-full bg-secondary p-6 flex flex-col gap-3">
          <h1 className="text-lg font-bold">Funding</h1>
          <div className="flex items-center justify-between gap-16 ">
            <div className="flex flex-col gap-4 items-center">
              <p className="text-slate-500 text-sm">Assets</p>
              <div className="flex gap-3">
                <Image
                  src={"https://app.aave.com/icons/tokens/dai.svg"}
                  alt=""
                  width={30}
                  height={20}
                />
                <h2 className="font-bold">DAI</h2>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <p className="text-slate-500 text-sm">Balance</p>
              <div className="flex flex-col items-center">
                <GetUserDeposit />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FundingButton />
              <WithdrawFundButton />
            </div>
          </div>
        </div>

        <div className="h-[50vh] w-full bg-secondary p-6 flex flex-col gap-3">
          <h1 className="text-lg font-bold">Faucets</h1>
          <div className="flex items-center justify-between gap-16 ">
            <div className="flex flex-col gap-4 items-center">
              <p className="text-slate-500 text-sm">Assets</p>
              <div className="flex gap-3">
                <Image
                  src={"https://app.aave.com/icons/tokens/eth.svg"}
                  alt=""
                  width={30}
                  height={20}
                />
                <h2 className="font-bold">ETH</h2>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <p className="text-slate-500 text-sm">Wallet Balance</p>
              <div className="flex flex-col items-center">
                <GetWalletBalanceEth />
              </div>
            </div>
            <div>
              <FaucetEthButton />
            </div>
          </div>
          <div className="border-b border-slate-700 w-full pt-2" />
          <div className="flex items-center justify-between gap-16 ">
            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-3">
                <Image
                  src={"https://app.aave.com/icons/tokens/dai.svg"}
                  alt=""
                  width={30}
                  height={20}
                />
                <h2 className="font-bold">DAI</h2>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col items-center">
                <GetWalletBalanceDai />
              </div>
            </div>
            <div>
              <FaucetDaiButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
