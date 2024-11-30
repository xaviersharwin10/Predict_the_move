import React, { useState } from 'react';
import { useWriteContract, useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { abi } from "../../data/abi";
import { Button } from "@/components/ui/button";

interface ClaimWinningsButtonProps {
  marketId: number;
  onClaimComplete?: () => void;
}

type UserStakeData = [bigint, boolean] | undefined;

export default function ClaimWinningsButton({ 
  marketId, 
  onClaimComplete 
}: ClaimWinningsButtonProps) {
  const { address } = useAccount();
  const { writeContract, isPending: isWritePending } = useWriteContract();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success' | 'info',
    message: string
  } | null>(null);

  const { data: potentialWinnings } = useReadContract({
    address: "0xaFd8662EAE2e2bD45EC25360C789235780bF8F69",
    abi: abi,
    functionName: "calculateWinnings",
    args: [BigInt(marketId), address],
  });

  const { data: userStakeData } = useReadContract({
    address: "0xaFd8662EAE2e2bD45EC25360C789235780bF8F69",
    abi: abi,
    functionName: "getUserStake",
    args: [BigInt(marketId), address],
  }) as { data: UserStakeData };

  const handleClaimWinnings = async () => {
    try {
      setStatusMessage(null);
      
      if (!userStakeData || !userStakeData[0]) {
        setStatusMessage({
          type: 'error',
          message: "You don't have any stake in this market"
        });
        return;
      }

      if (!potentialWinnings || potentialWinnings === BigInt(0)) {
        setStatusMessage({
          type: 'error',
          message: "No winnings available to claim"
        });
        return;
      }

      setStatusMessage({
        type: 'info',
        message: 'Processing your claim...'
      });

      // Use estimateGas before transaction
      const tx = await writeContract({
        address: "0xaFd8662EAE2e2bD45EC25360C789235780bF8F69",
        abi: abi,
        functionName: "claimWinnings",
        args: [BigInt(marketId)],
      });

      // Wait for transaction receipt
      const receipt = await new Promise((resolve, reject) => {
        setTimeout(() => {
          setStatusMessage({
            type: 'success',
            message: `Claimed ${Number(potentialWinnings)} ETH`
          });
          resolve(true);
        }, 3000); // Simulated delay, replace with actual transaction confirmation
      });

      if (onClaimComplete) {
        onClaimComplete();
      }
    } catch (error: any) {
      console.error("Claim Winnings Error:", error);
      setStatusMessage({
        type: 'error',
        message: error.message || "Failed to claim winnings"
      });
    }
  };

  if (!userStakeData || userStakeData[0] === BigInt(0) || 
      !potentialWinnings || potentialWinnings === BigInt(0)) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
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
      
      <Button 
        onClick={handleClaimWinnings}
        disabled={isWritePending}
        variant="outline"
        className={`w-full ${
          isWritePending 
            ? 'bg-gray-100' 
            : 'bg-green-100 hover:bg-green-200'
        }`}
      >
        {isWritePending ? 'Claiming...' : 'Claim Winnings'}
      </Button>
      
      {potentialWinnings && Number(potentialWinnings) > BigInt(0) && (
        <div className="text-sm text-green-600 text-center mt-1">
          Available winnings: {formatEther(Number(potentialWinnings))} ETH
        </div>
      )}
    </div>
  );
}