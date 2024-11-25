"use client";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { abi } from "../../data/abi";
import { toast } from "@/components/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateMarket() {
  const { address, isConnected } = useAccount();
  const {
    writeContract: createMarket,
    isSuccess,
    isPending,
    isError,
    error,
  } = useWriteContract();

  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");
  const [votedMarketsCount, setVotedMarketsCount] = useState(0);

  // Get total number of markets
  const { data: marketCount } = useReadContract({
    abi,
    address: "0x304750552F501c4722290047eC40edEf698F7DE3",
    functionName: "getMarketCount",
  });

  // Effect to fetch voting stats
  useEffect(() => {
    const fetchUserVotingStats = async () => {
      if (!isConnected || !address || !marketCount) return;

      let votedCount = 0;
      const totalMarkets = Number(marketCount);

      for (let i = 1; i <= totalMarkets; i++) {
        const { data } = await useReadContract({
          abi,
          address: "0x304750552F501c4722290047eC40edEf698F7DE3",
          functionName: "getUserStake",
          args: [BigInt(i), address],
        });

        if (data && data.stake > BigInt(0)) {
          votedCount++;
        }
      }

      setVotedMarketsCount(votedCount);
    };

    fetchUserVotingStats();
  }, [address, isConnected, marketCount]);

  // Handle the market creation process
  async function handleCreateMarket() {
    if (!isConnected) {
      console.error("Wallet not connected");
      return;
    }

    const endDateTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    try {
      const hash = await createMarket({
        abi,
        address: "0x304750552F501c4722290047eC40edEf698F7DE3",
        functionName: "createMarket",
        args: [question, BigInt(endDateTimestamp)],
      });
      console.log(hash);
    } catch (error) {
      console.error("Error creating market:", error);
      toast({
        title: "Error",
        description: "Failed to create market.",
        variant: "destructive",
      });
    }
  }

  // Show success message after market creation
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Market Created",
      });
      // Clear form after successful creation
      setQuestion("");
      setEndDate("");
    }
  }, [isSuccess]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 sm:max-w-[525px]">
      {isConnected && (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Total Markets Voted In</div>
              <div className="text-2xl font-bold">{votedMarketsCount}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="w-2/3 space-y-6">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="question">Market Question</Label>
          <Input
            id="question"
            placeholder="What is your question?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreateMarket}
          className="w-full"
          disabled={!isConnected || isPending}
        >
          {isPending ? "Creating..." : "Create Market"}
        </Button>

        {isError && (
          <div className="text-red-500 text-sm">Error: {error.message}</div>
        )}
      </div>
    </div>
  );
}