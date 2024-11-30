import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { abi } from "../../data/abi";
import { parseEther } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlaceStakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: number;
  marketQuestion: string;
}

export default function PlaceStakeModal({ 
  isOpen, 
  onClose, 
  marketId, 
  marketQuestion 
}: PlaceStakeModalProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [prediction, setPrediction] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const { writeContract, isError, error: writeError } = useWriteContract();

  const handleStake = async () => {
    try {
      setError('');
      if (!stakeAmount || prediction === null) {
        setError('Please enter stake amount and select a prediction');
        return;
      }

      const parsedAmount = parseEther(stakeAmount);

      writeContract({
        address: '0xaFd8662EAE2e2bD45EC25360C789235780bF8F69',
        abi: abi,
        functionName: 'placeStake',
        args: [BigInt(marketId), prediction],
        value: parsedAmount
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Stake</DialogTitle>
          <DialogDescription>
            {marketQuestion}
          </DialogDescription>
        </DialogHeader>
        
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Stake Amount (ETH)</Label>
              <Input
                id="stake-amount"
                type="number"
                step="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label>Your Prediction</Label>
              <div className="flex space-x-4">
                <Button
                  variant={prediction === true ? "default" : "outline"}
                  onClick={() => setPrediction(true)}
                  className="w-full"
                >
                  Yes
                </Button>
                <Button
                  variant={prediction === false ? "default" : "outline"}
                  onClick={() => setPrediction(false)}
                  className="w-full"
                >
                  No
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleStake}>
              Place Stake
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}