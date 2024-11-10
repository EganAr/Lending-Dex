const BorrowButton = dynamic(
  () => import("@/app/components/Lending/button/BorrowButton"),
  { ssr: false }
);
const RepayButton = dynamic(
  () => import("@/app/components/Lending/button/RepayButton"),
  { ssr: false }
);
const SupplyButton = dynamic(
  () => import("@/app/components/Lending/button/SupplyButton"),
  { ssr: false }
);
const WithdrawButton = dynamic(
  () => import("@/app/components/Lending/button/WithdrawButton"),
  { ssr: false }
);
const GetBorrow = dynamic(
  () => import("@/app/components/Lending/getters/GetBorrow"),
  { ssr: false }
);
const GetCollateral = dynamic(
  () => import("@/app/components/Lending/getters/GetCollateral"),
  { ssr: false }
);
const GetBorrowLimit = dynamic(
  () => import("@/app/components/Lending/getters/GetBorrowLimit"),
  { ssr: false }
);
const GetWalletBalanceEth = dynamic(
  () => import("@/app/components/Lending/getters/GetWalletBalanceEth"),
  { ssr: false }
);

const GetNetWorth = dynamic(
  () => import("@/app/components/Lending/getters/GetNetWorth"),
  { ssr: false }
);
const GetHealthFactor = dynamic(
  () => import("@/app/components/Lending/getters/GetHealthFactor"),
  { ssr: false }
);
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import dynamic from "next/dynamic";

export default function LendingPage() {
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
          ARBITRUM MARKET <p className="text-slate-500 text-sm">Sepolia ETH</p>
        </h1>
        <div className="flex items-center gap-6 text-button text-xl font-bold ">
          <div className="flex flex-col items-center">
            <h1 className="text-slate-500">Net Worth</h1>
            <GetNetWorth />
          </div>
          <div className="flex flex-col items-center ">
            <h1 className="text-slate-500">Health Factor</h1>
            <GetHealthFactor />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5">
        <div className="h-[25vh] w-[46vw] bg-secondary p-6 flex flex-col gap-3">
          <h1 className="text-xl font-bold">Your SuppLies</h1>
          <div className="flex items-center justify-between ">
            <div className="flex gap-16">
              <div className="flex flex-col items-center gap-4">
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
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-500 text-sm">Balance</p>
                <GetCollateral />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <SupplyButton />
              <WithdrawButton />
            </div>
          </div>
        </div>
        <div className="h-[25vh] w-[46vw] bg-secondary p-6 flex flex-col justify-between">
          <h1 className="text-xl font-bold">Your Borrows</h1>
          <div className="flex items-center justify-between ">
            <div className="flex gap-16">
              <div className="flex flex-col items-center gap-4">
                <p className="text-slate-500 text-sm">Assets</p>
                <div className="flex gap-3">
                  <Image
                    src={"https://app.aave.com/icons/tokens/dai.svg"}
                    alt=""
                    width={30}
                    height={30}
                  />
                  <h2 className="font-bold">DAI</h2>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-500 text-sm">Balance</p>
                <div className="flex flex-col items-center">
                  <GetBorrow />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <BorrowButton />
              <RepayButton />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 pt-5">
        <div className="h-[70vh] w-[46vw] bg-secondary p-6 flex flex-col gap-5">
          <h1 className="text-xl font-bold">Assets To SuppLies</h1>
          <div className="flex items-center justify-between ">
            <div className="flex gap-10">
              <div className="flex flex-col items-center gap-4">
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
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-500 text-sm">Wallet Balance</p>
                <div className="flex flex-col items-center">
                  <GetWalletBalanceEth />
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <p className="text-slate-500 text-sm">Can be collateral</p>
                <h1>✔</h1>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-5">
              <SupplyButton />
            </div>
          </div>
        </div>
        <div className="h-[70vh] w-[46vw] bg-secondary p-6 flex flex-col gap-5">
          <h1 className="text-xl font-bold">Assets To Borrows</h1>
          <div className="flex items-center justify-between ">
            <div className="flex gap-10">
              <div className="flex flex-col items-center gap-4">
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
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-500 text-sm">Available</p>
                <GetBorrowLimit />
              </div>
            </div>
            <BorrowButton />
          </div>
        </div>
      </div>
    </section>
  );
}
