"use client";

import { useAccount, useEnsName, useReadContracts } from "wagmi";
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateMarket from "@/app/create-market/page";
import PollCard from "@/components/PollCard";
import OverviewCard from "@/components/OverviewCard";
import TrendingPolls from "@/components/TrendingPolls";
import PeopleToFollow from "@/components/PeopleToFollow";
import ThreeVotes from "@/components/ThreeVotes";
import { TweetPoll } from "@/components/TweetPoll";
import { FeedItem } from "@/components/FeedItem";
import { useReadContract } from "wagmi";
import { abi } from "../data/abi";
import { toast } from "@/components/hooks/use-toast";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: enrrrsName } = useEnsName({ address });
  const [activeTab, setActiveTab] = useState("For You");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pollData, setPollData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [marketCount, setMarketCount] = useState(0);
  const [marketDetails, setMarketDetails] = useState<MarketDetail[]>([]);

  type MarketDetail = {
    question: string;
    owner: string;
    endDate: number; // Assuming this is a timestamp in seconds
    totalYesStake: number;
    totalNoStake: number;
  };

  // Fetch market count
  const { data: countData, isSuccess: countSuccess, isError: countError, error: countErrorMsg } = useReadContract({
    abi,
    address: "0x9EE515e111219D83E20DC4040994cC3043bA9b92",
    functionName: "getMarketCount",
  });

  const contractCalls = Array.from({ length: Number(countData) }).map(
    (_, index) => ({
      abi,
      address: '0x9EE515e111219D83E20DC4040994cC3043bA9b92',
      functionName: "getMarketDetails",
      args: [index],
    })
  );

  const { data: ballots, isLoading: ballotsLoading } = useReadContracts({
    contracts: contractCalls,
  });
  // Fetch market details
  const fetchMarketDetails = async (count: number) => {
    const details: MarketDetail[] = [];

    for (let i = 0; i < count; i++) {
      const { data, isSuccess, isError, error } = await useReadContract({
        abi,
        address: "0x9EE515e111219D83E20DC4040994cC3043bA9b92",
        functionName: "getMarketDetails",
        args: [i], // Assuming getMarketDetails takes an index as an argument
      });

      if (isSuccess && data) {
        // Ensure data is correctly typed
        const marketDetail = data as MarketDetail; // Cast to MarketDetail type
        details.push(marketDetail); // Now this should work without error
      } else {
        console.error(`Error fetching market details for index ${i}:`, error);
      }
    }
    setMarketDetails(details);
  };

  useEffect(() => {
    if (countSuccess && countData) {
      const count = Array.isArray(countData) ? countData[0].toNumber() : Number(countData); // Adjust based on how countData is structured
      setMarketCount(count);
      fetchMarketDetails(count);
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


  type FeedItemData = {
    author: string;
    content: string;
    time: string;
  };


  const [feedItems, setFeedItems] = useState<FeedItemData[]>([
    {
      author: "Jane Doe",
      content: "Check out the latest integration with AirDAO!",
      time: "3 hours ago",
    },
  ]);

  const tabs = ["Trending"]; // Initially only "Trending" is present

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const pollData1 = [
    {
      author: "Jane Doe",
      question: "Should we integrate NounsDAO with AirDAO?",
      initialYesAmount: 5000,
      initialNoAmount: 2500,
      timeLeft: "5 days",
    },
    {
      author: "John Smith",
      question: "Will ETH reach $5000 by end of 2024?",
      initialYesAmount: 12000,
      initialNoAmount: 8000,
      timeLeft: "10 days",
    },
    {
      author: "Alice Johnson",
      question: "Will Worldcoin adoption increase in 2025?",
      initialYesAmount: 7000,
      initialNoAmount: 6000,
      timeLeft: "3 days",
    },
  ];

  const handleVote = (vote: string, amount: number, author: string, question: string) => {
    console.log(`Voted ${vote} with amount ${amount} for poll by ${author}: ${question}`);
    
    const newFeedItem: FeedItemData = {
      author: "You",
      content: (
        <>
          I voted <strong className="font-bold">{vote}</strong> with{" "}
          <span className="text-green-500 font-semibold">{amount} AMB</span> on{" "}
          <strong>{question}</strong> by
          <span className="text-purple-500 font-medium"> {author}</span>.
        </>
      ),
      time: "Just now",
    };

    setFeedItems([newFeedItem, ...feedItems]);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9">
          {isConnected ? (
            <div className="mx-2 text-3xl font-medium">
              Welcome
              {address ? (
                <span className="text-3xl font-bold">{` ${address}`}</span>
              ) : (
                <span className="text-3xl font-bold">{` ${formatAddress(address!)} `}</span>
              )}
              👋🏻
            </div>
          ) : (
            <div className="mx-2 text-3xl font-medium">
              <p className="text-lg font-semibold mb-4">Hello Stranger, please connect your wallet</p>
            </div>
          )}

          {isConnected && (
            <div className="flex mt-10 mb-4">
              <button
                onClick={() => handleTabClick("For You")}
                className={`py-2 mx-2 text-lg font-bold focus:outline-none ${
                  activeTab === "For You" ? "border-b-2 border-gray-600 text-black-600 dark:border-gray-200 dark:text-gray-50" : "border-b-2 border-transparent text-gray-600 hover:text-black-400"
                }`}
              >
                For You
              </button>
              <button
                onClick={() => handleTabClick("Trending")}
                className={`py-2 mx-2 text-lg font-bold focus:outline-none ${
                  activeTab === "Trending" ? "border-b-2 border-gray-600 text-black-600 dark:border-gray-200 dark:text-gray-50" : "border-b-2 border-transparent text-gray-600 hover:text-black-400"
                }`}
              >
                Trending
              </button>
            </div>
          )}

          <div>
            {activeTab === "For You" && isConnected && (
              <div>
                <div className="mx-2">
                  <input
                    type="text"
                    placeholder="What do you think?"
                    className="p-4 border border-gray-300 rounded-md w-full"
                    onClick={() => setDialogOpen(true)}
                  />
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger>{/* Hidden trigger */}</DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create Market</DialogTitle>
                      <DialogDescription>Create your own market here. Click submit when you're done.</DialogDescription>
                    </DialogHeader>
                    <CreateMarket />
                  </DialogContent>
                </Dialog>
                <div className="mx-2 py-4">
                  {feedItems.map((item, index) => (
                    <FeedItem key={index} author={item.author} content={item.content} time={item.time} />
                  ))}

                    {marketDetails.length> 0?(marketDetails.map((poll, index) => (
                      <TweetPoll
                        key={index}
                        author={poll.owner}
                        question={poll.question}
                        totalYesStake={poll.totalYesStake.toString()}
                        totalNoStake={poll.totalNoStake.toString()}
                        timeLeft={new Date(poll.endDate * 1000).toLocaleString()}
                        onVote={() => handleVote( poll.totalYesStake, poll.owner, poll.question)} // Adjusted for vote handling
                      />
                    ))
                  ) : (
                    <div>No markets found</div>
                  )}
                </div>
              </div>
            )}

            {(activeTab === "Trending" || !isConnected) && (
              <div>
                {pollData1.map((poll, index) => (
                  <TweetPoll
                    key={index}
                    author={poll.author}
                    question={poll.question}
                    initialYesAmount={poll.initialYesAmount}
                    initialNoAmount={poll.initialNoAmount}
                    timeLeft={poll.timeLeft}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-3 space-y-4">
          <OverviewCard />
          <TrendingPolls />
          <PeopleToFollow />
          <ThreeVotes />
        </div>
      </div>
    </MainLayout>
  );
}
