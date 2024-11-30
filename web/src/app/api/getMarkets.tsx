"use client";
import React, { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { abi } from "../../data/abi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import PlaceStakeModal from "./placeStake";
import ResolveMarketButton from "./resolveMarkets";
import ClaimWinningsButton from "./claimWinnings";
import UserMarketStake from './userMarketStake'; // Add this import



type MarketData = [
  bigint[], // marketIds
  string[], // owners
  string[], // questions
  bigint[], // totalYesStakes
  bigint[], // totalNoStakes
  bigint[], // endDates
  number[]  // outcomes
];

export default function GetAllMarkets() {
  interface FormattedMarket {
    id: number;
    owner: string;
    question: string;
    totalYesStake: string;
    totalNoStake: string;
    endDate: string;
    outcome: string;
    hasUserStaked?: boolean;
  }

  const [markets, setMarkets] = useState<FormattedMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<FormattedMarket | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const account = useAccount();

  // Debug logging for contract data retrieval
  const { data: marketData, isError, isLoading } = useReadContract({
    abi,
    address: "0xaFd8662EAE2e2bD45EC25360C789235780bF8F69",
    functionName: "getAllMarkets",
  }) as { data: MarketData | undefined, isError: boolean, isLoading: boolean };

  // Debug logging for contract data
  useEffect(() => {
    console.log('Full Market Data:', marketData);
    console.log('Is Loading:', isLoading);
    console.log('Is Error:', isError);
  }, [marketData, isLoading, isError]);
  
  useEffect(() => {
    if (marketData) {
      console.log('Raw Market Data Lengths:', {
        marketIds: marketData[0].length,
        owners: marketData[1].length,
        questions: marketData[2].length,
        totalYesStakes: marketData[3].length,
        totalNoStakes: marketData[4].length,
        endDates: marketData[5].length,
        outcomes: marketData[6].length
      });

      const [marketIds, owners, questions, totalYesStakes, totalNoStakes, endDates, outcomes] = marketData;
      
      const formattedMarkets = marketIds.map((id: bigint, index: number) => ({
        id: Number(id),
        owner: owners[index],
        question: questions[index],
        totalYesStake: totalYesStakes[index].toString(),
        totalNoStake: totalNoStakes[index].toString(),
        endDate: new Date(Number(endDates[index]) * 1000).toLocaleDateString(),
        outcome: ["Unresolved", "Yes", "No"][Number(outcomes[index])]
      }));

      setMarkets(formattedMarkets);
    }
  }, [marketData]);

  const handleStakeClick = (market:any) => {
    setSelectedMarket(market);
    setIsStakeModalOpen(true);
  };

  if (isLoading) return <div>Loading markets...</div>;
  if (isError) return <div>Error loading markets</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">All Markets</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <Card key={market.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{market.question}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Market ID:</span>
                  <span>{market.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Yes Stake:</span>
                  <span>{formatEther(market.totalYesStake)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">No Stake:</span>
                  <span>{formatEther(market.totalNoStake)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">End Date:</span>
                  <span>{market.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`font-bold ${
                    market.outcome === "Unresolved" 
                      ? "text-yellow-500" 
                      : market.outcome === "Yes" 
                      ? "text-green-500" 
                      : "text-red-500"
                  }`}>
                    {market.outcome}
                  </span>
                </div>
              </div>
              <UserMarketStake 
                marketId={market.id} 
                render={(hasStaked: boolean | undefined) => {
                  // Store the staked status
                  market.hasUserStaked = hasStaked;
                  return null;
                }} 
              />
              <div className="mt-4 space-x-2 flex justify-between">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleStakeClick(market)}
                  disabled={ market.hasUserStaked || market.outcome !== "Unresolved" || account.address == market.owner}
                >
                  Place Stake
                </Button>
                <ResolveMarketButton 
                  market={market}
                  onResolutionComplete={() => {
                    window.location.reload();
                  }}
                />
              </div>
              <div className="mt-4 space-x-2 flex justify-end">
              {market.outcome !== "Unresolved" && (
                <ClaimWinningsButton 
                  marketId={market.id}
                  onClaimComplete={() => {
                    window.location.reload();
                  }}
                />
              )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {markets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No markets found</p>
        </div>
      )}

      {selectedMarket && (
        <PlaceStakeModal
          isOpen={isStakeModalOpen}
          onClose={() => {
            setIsStakeModalOpen(false);
            setSelectedMarket(selectedMarket);
          }}
          marketId={selectedMarket.id}
          marketQuestion={selectedMarket.question}
        />
      )}
    </div>
  );
}