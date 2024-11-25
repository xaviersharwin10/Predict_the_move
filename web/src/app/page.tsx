"use client";

import { useAccount, useEnsName } from "wagmi";
import React, { useState } from "react";
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
import GetAllMarkets from "./api/getMarkets";
import PollCard from "@/components/PollCard";
import OverviewCard from "@/components/OverviewCard";
import TrendingPolls from "@/components/TrendingPolls";
import PeopleToFollow from "@/components/PeopleToFollow";
import ThreeVotes from "@/components/ThreeVotes";
import { TweetPoll } from "@/components/TweetPoll";
import { FeedItem } from "@/components/FeedItem";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [activeTab, setActiveTab] = useState("For You");
  const [dialogOpen, setDialogOpen] = useState(false);

  const tabs = ["Trending"]; // Initially only "Trending" is present

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  type FeedItemData = {
    author: string;
    content: string;
    time: string;
  };

  const pollData = [
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

  // Initial feed data
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([
    {
      author: "Jane Doe",
      content: "Check out the latest integration with AirDAO!",
      time: "3 hours ago",
    },
  ]);

  // Handle vote and add new feed item
  const handleVote = (
    vote: string,
    amount: number,
    author: string,
    question: string
  ) => {
    console.log(
      `Voted ${vote} with amount ${amount} for poll by ${author}: ${question}`
    );

    // Create new feed item content based on the vote
    const newFeedItem: FeedItemData = {
      author: "You", // Assuming the user is the one who voted
      content: (
        <>
          I voted <strong className="font-bold">{vote}</strong> with{" "}
          <span className="text-green-500 font-semibold">{amount} AMB</span> on{" "}
          <strong>{question}</strong> by
          <span className="text-psurple-500 font-medium"> {author}</span>.
        </>
      ),
      time: "Just now", // You could use a date-time library like dayjs to format real timestamps
    };

    // Update the feedItems state and add the new feed at the top
    setFeedItems([newFeedItem, ...feedItems]);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <MainLayout>
      {/* Welcome message */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9">
          {isConnected ? (
            <div className="mx-2 text-3xl font-medium">
              Welcome
              {ensName ? (
                <span className="text-3xl font-bold">{` ${ensName}`}</span>
              ) : (
                <span className="text-3xl font-bold">{` ${formatAddress(
                  address!
                )} `}</span>
              )}
              👋🏻
            </div>
          ) : (
            <div className="mx-2 text-3xl font-medium">
              <p className="text-lg font-semibold mb-4">
                Hello Stranger, please connect your wallet
              </p>
            </div>
          )}

          <div className="flex flex-row items-center justify-between p-2">
            <div>
              <h1 className="text-xl font-medium">
          Predict. Earn. Live. Predict again. 
              </h1>
            </div>

          

            {/* <Button
              asChild
              className="bg-indigo-500 text-white hover:bg-indigo-600"
            >
              <a
                href="https://web.telegram.org/k/#@TrendSage_Bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trend Sage Bot 🤖
              </a>
            </Button> */}
          </div>

          {/* Tab Navigation */}
          {isConnected && (
            <div className="flex mt-2 mb-4">
              {/* Show "For You" tab only if connected */}
              {/* <button
                onClick={() => handleTabClick("For You")}
                className={`py-2 mx-2 text-lg font-bold focus:outline-none ${
                  activeTab === "For You"
                    ? "border-b-2 border-gray-600 text-black-600 dark:border-gray-200 dark:text-gray-50"
                    : "border-b-2 border-transparent text-gray-600 hover:text-black-400"
                }`}
              >
                For You
              </button> */}
              {/* "Trending" tab is always present */}
              {/* <button
                onClick={() => handleTabClick("Trending")}
                className={`py-2 mx-2 text-lg font-bold focus:outline-none ${
                  activeTab === "Trending"
                    ? "border-b-2 border-gray-600 text-black-600 dark:border-gray-200 dark:text-gray-50"
                    : "border-b-2 border-transparent text-gray-600 hover:text-black-400"
                }`}
              >
                Trending
              </button> */}
            </div>
          )}

          {/* Tab Content */}
          <div>
            {activeTab === "For You" && isConnected && (
              <div>
                <div className="mx-2">
                  <input
                    type="text"
                    placeholder="Click to create Market!"
                    className="p-4 border border-gray-300 rounded-md w-full"
                    onClick={() => setDialogOpen(true)}
                  />
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger>{/* Hidden trigger */}</DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create Market</DialogTitle>
                      <DialogDescription>
                        Create your own market here. Click submit when you're
                        done.
                      </DialogDescription>
                    </DialogHeader>
                    <CreateMarket />
                  </DialogContent>
                </Dialog>
                {/* <div className="mx-2 py-4">
                  {feedItems.map((item, index) => (
                    <FeedItem
                      key={index}
                      author={item.author}
                      content={item.content}
                      time={item.time}
                    />
                  ))}

                  {pollData.map((poll, index) => (
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
                </div> */}
                <div>
                  < GetAllMarkets/>
                </div>
              </div>
            )}

            {/* Always display Trending content */}
            {(activeTab === "Trending" || !isConnected) && (
              <div>
                {pollData.map((poll, index) => (
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
          {/* <TrendingPolls />
          <PeopleToFollow />
          <ThreeVotes /> */}
        </div>
      </div>
    </MainLayout>
  );
}
