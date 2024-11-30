import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { abi } from '../../data/abi';
import { parseEther, formatEther } from 'viem';

interface UserMarketStakeProps {
  marketId: number;
  render?: (hasStaked: boolean) => React.ReactNode;
}

const UserMarketStake: React.FC<UserMarketStakeProps> = ({ marketId, render }) => {
  const [userStake, setUserStake] = useState<{
    stake: bigint;
    votedYes: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStaked, setHasStaked] = useState(false);

  const account = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchUserStake = async () => {
      // Reset state
      setIsLoading(true);
      setError(null);
      setHasStaked(false);

      // Check if user is connected
      if (!account.address) {
        setError('Wallet not connected');
        setIsLoading(false);
        return;
      }

      try {
        // Call getUserStake function from the contract
        const data = await publicClient.readContract({
          address: '0xaFd8662EAE2e2bD45EC25360C789235780bF8F69', // Your contract address
          abi: abi,
          functionName: 'getUserStake',
          args: [BigInt(marketId), account.address]
        });

        // Data is returned as [stake, votedYes]
        const stake = data[0];
        const votedYes = data[1];

        setUserStake({
          stake,
          votedYes
        });

        // Set hasStaked based on stake amount
        setHasStaked(stake !== BigInt(0));
      } catch (err) {
        console.error('Error fetching user stake:', err);
        setError('Failed to fetch stake information');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if account is connected
    if (account.address) {
      fetchUserStake();
    }
  }, [marketId, account.address, publicClient]);

  // If render prop is provided, use it to render custom content
  useEffect(() => {
    if (render && !isLoading) {
      render(hasStaked);
    }
  }, [render, hasStaked, isLoading]);

  if (!account.address) {
    return <div className="text-gray-500">Connect wallet to see your stake</div>;
  }

  if (isLoading) {
    return <div>Loading stake information...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!hasStaked) {
    return <div className="text-gray-500">No stake in this market</div>;
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between">
        <span className="font-medium">Your Stake:</span>
        <span className="font-bold">
          {userStake ? formatEther(userStake.stake) : '0'} ETH
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Your Prediction:</span>
        <span className={`font-bold ${
          userStake?.votedYes ? 'text-green-500' : 'text-red-500'
        }`}>
          {userStake?.votedYes ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
};

export default UserMarketStake;