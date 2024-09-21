"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import { useAccount, useBalance } from 'wagmi';

const weiToEther = (wei: string) => {
  return (parseFloat(wei) / 1e18).toFixed(4); // 18 decimals for Ether
};

const OverviewCard = () => {
  const { address, isConnected } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;

  const formattedBalance = data ? weiToEther(data.value.toString()) : '0';


  return (
    <div className="bg-white border rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        <Pin className="w-5 h-5 text-orange-500" />
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-sm text-orange-500">Claim Winnings</p>
        {isConnected ? (
        <h3 className="text-3xl font-bold text-black">$ {formattedBalance} {data?.symbol}</h3>
      ) : (
        <p>Please connect your wallet</p>
      )}
      </div>

      {/* Buttons */}
      <div className="flex space-x-2 mb-4">
        <Button
          className="bg-orange-500 text-white rounded-full px-4 py-1 hover:bg-orange-600"
          // Add withdraw logic here
        >
          Withdraw
        </Button>
      </div>

      {/* Leaderboard */}
      <div>
        <p className="text-orange-500 font-medium">Leaderboard</p>
        <p className="text-gray-500 text-sm">Coming Soon</p>
      </div>
    </div>
  );
};

export default OverviewCard;
