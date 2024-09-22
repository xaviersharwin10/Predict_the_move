"use client";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { abi } from "../data/abi"; // Adjust the path as necessary
import { toast } from "@/components/hooks/use-toast";

type MarketDetail = {
  question: string;
  owner: string;
  endDate: number; // Assuming this is a timestamp in seconds
  totalYesStake: number;
  totalNoStake: number;
};

const FetchMarketDetails = () => {
  const [marketCount, setMarketCount] = useState<number>(0);
  const [marketDetails, setMarketDetails] = useState<MarketDetail[]>([]);

  // Fetch market count
  const {
    data: countData,
    isSuccess: countSuccess,
    isError: countError,
    error: countErrorMsg,
  } = useReadContract({
    abi,
    address: "0xf3Af83f160E9cb1e323c97398F5d4A5fDFE95bcD",
    functionName: "getMarketCount",
  });

  // Handle market count success and errors
  useEffect(() => {
    if (countSuccess && countData) {
      const count = Array.isArray(countData) ? countData[0].toNumber() : Number(countData);
      setMarketCount(count);
    }

    if (countError) {
      console.error("Error fetching market count:", countErrorMsg);
      toast({
        title: "Error",
        description: "Failed to fetch market count.",
        variant: "destructive",
      });
    }
  }, [countSuccess, countData, countError, countErrorMsg]);

  // Fetch market details for each market
  useEffect(() => {
    const fetchMarketDetails = async () => {
      const details: MarketDetail[] = [];

      for (let i = 0; i < marketCount; i++) {
        const { data, isSuccess, isError, error } = await useReadContract({
          abi,
          address: "0xf3Af83f160E9cb1e323c97398F5d4A5fDFE95bcD",
          functionName: "getMarketDetails",
          args: [i], // Assuming getMarketDetails takes an index as an argument
        });

        if (isSuccess && data) {
          const marketDetail = data as MarketDetail; // Cast to MarketDetail type
          details.push(marketDetail);
        } else if (isError) {
          console.error(`Error fetching market details for index ${i}:`, error);
        }
      }

      setMarketDetails(details);
    };

    if (marketCount > 0) {
      fetchMarketDetails();
    }
  }, [marketCount]);

  return (
    <div>
      <h2>Market Count: {marketCount}</h2>
      <ul>
        {marketDetails.map((market, index) => (
          <li key={index}>
            <strong>Question:</strong> {market.question}
            <br />
            <strong>Owner:</strong> {market.owner}
            <br />
            <strong>End Date:</strong> {new Date(market.endDate * 1000).toLocaleString()}
            <br />
            <strong>Yes Stake:</strong> {market.totalYesStake}
            <br />
            <strong>No Stake:</strong> {market.totalNoStake}
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FetchMarketDetails;
