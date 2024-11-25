"use client";
import React, { useEffect, useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { abi } from "../../data/abi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlaceStakeModal from "./placeStake";
import ResolveMarketButton from "./resolveMarkets";
import ClaimWinningsButton from "./claimWinnings";

type MarketData = [
  bigint[], // marketIds
  string[], // owners
  string[], // questions
  bigint[], // totalYesStakes
  bigint[], // totalNoStakes
  bigint[], // endDates
  number[]  // outcomes
];

interface FormattedMarket {
  id: number;
  owner: string;
  question: string;
  totalYesStake: string;
  totalNoStake: string;
  endDate: string;
  outcome: string;
  userYesStake?: string;
  userNoStake?: string;
}

export default function GetAllMarkets() {
  const [markets, setMarkets] = useState<FormattedMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<FormattedMarket | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const { address: userAddress } = useAccount();

  // Get all markets
  const { data: marketData, isError, isLoading } = useReadContract({
    abi,
    address: "0x304750552F501c4722290047eC40edEf698F7DE3",
    functionName: "getAllMarkets",
  }) as { data: MarketData | undefined, isError: boolean, isLoading: boolean };

  // Get user stakes for each market
  const { data: userStakes } = useReadContract({
    abi,
    address: "0x304750552F501c4722290047eC40edEf698F7DE3",
    functionName: "getUserStakes",
    args: [userAddress],
  }) as { data: [bigint[], bigint[]] | undefined };

  useEffect(() => {
    if (marketData) {
      const [marketIds, owners, questions, totalYesStakes, totalNoStakes, endDates, outcomes] = marketData;
      
      const formattedMarkets = marketIds.map((id: bigint, index: number) => {
        const marketId = Number(id);
        let userYesStake, userNoStake;

        // If we have user stakes data, find the corresponding stake for this market
        if (userStakes) {
          const [yesStakes, noStakes] = userStakes;
          userYesStake = yesStakes[marketId]?.toString();
          userNoStake = noStakes[marketId]?.toString();
        }

        return {
          id: marketId,
          owner: owners[index],
          question: questions[index],
          totalYesStake: totalYesStakes[index].toString(),
          totalNoStake: totalNoStakes[index].toString(),
          endDate: new Date(Number(endDates[index]) * 1000).toLocaleDateString(),
          outcome: ["Unresolved", "Yes", "No"][Number(outcomes[index])],
          userYesStake,
          userNoStake,
        };
      });

      setMarkets(formattedMarkets);
    }
  }, [marketData, userStakes]);

  const handleStakeClick = (market: FormattedMarket) => {
    setSelectedMarket(market);
    setIsStakeModalOpen(true);
  };

  if (isLoading) return <div>Loading markets...</div>;
  if (isError) return <div>Error loading markets</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">All Prediction Markets</h2>
      
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
                  <span>{market.totalYesStake} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">No Stake:</span>
                  <span>{market.totalNoStake} ETH</span>
                </div>
                {(market.userYesStake || market.userNoStake) && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <div className="font-medium text-gray-700 mb-2">Your Stakes:</div>
                    {market.userYesStake && Number(market.userYesStake) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Yes Position:</span>
                        <span>{market.userYesStake} ETH</span>
                      </div>
                    )}
                    {market.userNoStake && Number(market.userNoStake) > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>No Position:</span>
                        <span>{market.userNoStake} ETH</span>
                      </div>
                    )}
                  </div>
                )}
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

              <div className="mt-4 space-x-2 flex justify-between">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleStakeClick(market)}
                  disabled={market.outcome !== "Unresolved"}
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
            setSelectedMarket(null);
          }}
          marketId={selectedMarket.id}
          marketQuestion={selectedMarket.question}
        />
      )}
    </div>
  );
}