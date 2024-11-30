"use client";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { abi } from "../../data/abi";
import { toast } from "@/components/hooks/use-toast"; 

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
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreateMarket() {
    // Reset previous error message
    setErrorMessage("");

    if (!isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    const endDateTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    try {
      await createMarket({
        abi,
        address: "0xaFd8662EAE2e2bD45EC25360C789235780bF8F69",
        functionName: "createMarket",
        args: [question, endDateTimestamp],
      });
    } catch (err: unknown) {
      // Type guard to check if err is an Error object
      if (err instanceof Error) {
        // Extract the error message from the revert reason
        const errorStr = err.message;
        let matchedError = errorStr.match(/reason="([^"]+)"/);
        
        if (matchedError) {
          const specificError = matchedError[1];
          setErrorMessage(specificError);
          
          toast({
            title: "Error",
            description: specificError,
            variant: "destructive",
          });
        } else {
          // Fallback error handling
          toast({
            title: "Error",
            description: err.message || "Failed to create market.",
            variant: "destructive",
          });
        }
      } else {
        // Handle case where err is not an Error object
        toast({
          title: "Error",
          description: "An unknown error occurred.",
          variant: "destructive",
        });
      }
      
      console.error("Error creating market:", err);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center sm:max-w-[525px]">
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

        <Button onClick={handleCreateMarket} className="w-full">
          Create Market
        </Button>

        {errorMessage && (
          <div className="text-red-500 mt-2">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}