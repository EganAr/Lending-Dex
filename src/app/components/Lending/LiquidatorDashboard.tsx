"use client";

import React, { useEffect, useState } from "react";
import {
  getBorrowers,
  getHealthFactor,
  getUserCollateral,
  getUserCollateralValue,
  liquidate,
} from "@/web3";
import useWallet from "../ConnectWallet";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import LiquidateButton from "./button/LiquidateButton";
import Image from "next/image";

interface BorrowerInfo {
  address: string;
  healthFactor: string;
  borrowedAmount: string;
  collateral: string;
  collateralInUSD: string;
}

export default function LiquidatorDashboard() {
  const { account } = useWallet();
  const [borrowersData, setBorrowersData] = useState<BorrowerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBorrowerData = async (address: string): Promise<BorrowerInfo> => {
    try {
      const { healthFactor, borrowedAmount } = await getHealthFactor(address);
      const collateral = await getUserCollateral(address);
      const collateralInUSD = await getUserCollateralValue(address);

      return {
        address,
        healthFactor,
        borrowedAmount,
        collateral,
        collateralInUSD,
      };
    } catch (error) {
      console.log(error);
      return {
        address: "",
        healthFactor: "",
        borrowedAmount: "",
        collateral: "",
        collateralInUSD: "",
      };
    }
  };

  useEffect(() => {
    const fetchAllBorrowersData = async () => {
      if (!account) return;
      try {
        setIsLoading(true);
        const borrowers = await getBorrowers();

        const borrowersInfo = await Promise.all(
          borrowers.map((address) => fetchBorrowerData(address))
        );
        setBorrowersData(borrowersInfo);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllBorrowersData();
    const intervalId = setInterval(fetchAllBorrowersData, 30000);
    return () => clearInterval(intervalId);
  }, [account]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading borrowers data...</div>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableCaption>A List of Borrowers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Health Factor</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Debt</TableHead>
            <TableHead>Bonus Liquidate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {borrowersData.map((borrower) => (
            <TableRow key={borrower.address}>
              <TableCell className="w-[10px] ">{borrower.address}</TableCell>
              <TableCell className="w-[10px] text-green-500">
                {borrower.healthFactor}
              </TableCell>
              <TableCell className="flex items-center">
                <div className="relative">
                  <Image
                    src={"https://app.aave.com/icons/tokens/dai.svg"}
                    alt=""
                    className="absolute top-2 left-2"
                    width={20}
                    height={20}
                  />
                  <Image
                    src={"https://app.aave.com/icons/tokens/eth.svg"}
                    alt=""
                    className=""
                    width={20}
                    height={20}
                  />
                </div>
              </TableCell>
              <TableCell className="text-red-500">
                $ {borrower.borrowedAmount}
              </TableCell>
              <TableCell className="text-green-500">10%</TableCell>
              <TableCell>
                <LiquidateButton
                  borrowerAddress={borrower.address}
                  debtAmount={borrower.borrowedAmount}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
