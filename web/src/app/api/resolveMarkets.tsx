import React from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { abi } from "../../data/abi";
import { formatEther } from 'viem';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Market {
  id: number;
  owner: string;
  question: string;
  totalYesStake: string;
  totalNoStake: string;
  endDate: string;
  outcome: string;
}

interface ResolveMarketButtonProps {
  market: Market;
  onResolutionComplete?: () => void;
}

export default function ResolveMarketButton({ market, onResolutionComplete }: ResolveMarketButtonProps) {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [isOpen, setIsOpen] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: 'error' | 'success' | 'info',
    message: string
  } | null>(null);

  const isOwner = address?.toLowerCase() === market.owner.toLowerCase();
  
  // Convert endDate string (DD/MM/YYYY) to timestamp for comparison
  const [day, month, year] = market.endDate.split('/').map(Number);
  const endDateTimestamp = new Date(year, month - 1, day).getTime();
  const currentTimestamp = new Date().getTime();
  
  const isPastEndDate = currentTimestamp > endDateTimestamp;
  const isUnresolved = market.outcome === "Unresolved";

  const handleResolve = async (_outcome: boolean) => {
    try {
      setStatusMessage({
        type: 'info',
        message: `Resolving market as ${_outcome ? 'Yes' : 'No'}...`
      });

      const tx = await writeContract({
        address: "0xaFd8662EAE2e2bD45EC25360C789235780bF8F69",
        abi: abi,
        functionName: "resolveMarket",
        args: [BigInt(market.id), _outcome],
      });

      // Simulated transaction confirmation
      await new Promise((resolve) => {
        setTimeout(() => {
          setStatusMessage({
            type: 'success',
            message: `Market resolved as ${_outcome ? 'Yes' : 'No'}`
          });
          resolve(true);
        }, 3000);
      });

      setIsOpen(false);
      if (onResolutionComplete) {
        onResolutionComplete();
      }
    } catch (error: any) {
      console.error("Resolve Market Error:", error);
      setStatusMessage({
        type: 'error',
        message: error.message || "Failed to resolve market"
      });
    }
  };

  if (!isOwner) return null;

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        disabled={!isPastEndDate || !isUnresolved}
        className="bg-yellow-100 hover:bg-yellow-200 w-full"
      >
        {!isUnresolved ? "Already Resolved" : 
         !isPastEndDate ? `Ends in ${Math.ceil((endDateTimestamp - currentTimestamp) / (1000 * 60 * 60 * 24))} days` : 
         "Resolve Market"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Market</DialogTitle>
          </DialogHeader>
          
          {statusMessage && (
            <div className={`p-3 rounded-md border ${
              statusMessage.type === 'error' 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : statusMessage.type === 'success'
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              {statusMessage.message}
            </div>
          )}
          
          <div className="py-4">
            <h3 className="font-medium mb-2">Question:</h3>
            <p className="text-gray-600 mb-4">{market.question}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Yes Stake:</span>
                <span>{formatEther(market.totalYesStake)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total No Stake:</span>
                <span>{formatEther(market.totalNoStake)} ETH</span>
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => handleResolve(true)}
              disabled={isPending}
            >
              {isPending ? 'Resolving Yes...' : 'Resolve as Yes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleResolve(false)}
              disabled={isPending}
            >
              {isPending ? 'Resolving No...' : 'Resolve as No'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}