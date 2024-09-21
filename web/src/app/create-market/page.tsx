"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { abi } from "../../data/abi";
// import { ABI } from "@/lib/consts"; // Import your ABI÷
// import { CONTRACT_ADDRESS } from "@/lib/consts"; // Ensure this is your contract address
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

  // const { write: createMarket, error } = useWriteContract({
  //   address: '0x3dD8cbB87fb42F7E7445847c46dc3a802a904cfb',
  //   abi: ABI,
  //   functionName: "createMarket",
  // });

  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");

  async function handleCreateMarket() {
    if (!isConnected) {
      console.error("Wallet not connected");
      return;
    }

    const endDateTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    try {
      const hash = createMarket({
        abi,
        address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        functionName: "createMarket",
        // args: [
        //   'is Donald trump going to win',
        //   '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
        //   // 123n,
        // ],
        args: [question, endDateTimestamp],
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

  useEffect(() => {
    if (isSuccess) {
      console.log("Market created:");
      toast({
        title: "Market Created",
      });
    }
  }, []);

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

        {isError && <div>Error: {error.message}</div>}
      </div>
    </div>
  );
}
