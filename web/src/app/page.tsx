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

const tabs = ["Trending"]; // Initially only "Trending" is present

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [activeTab, setActiveTab] = useState("Trending");
  const [dialogOpen, setDialogOpen] = useState(false);

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

          {/* Tab Navigation */}
          {isConnected && (
            <div className="flex mt-10 mb-4">
              {/* Show "For You" tab only if connected */}
              <button
                onClick={() => handleTabClick("For You")}
                className={`py-2 mx-2 text-lg font-bold focus:outline-none ${
                  activeTab === "For You"
                    ? "border-b-2 border-gray-600 text-black-600 dark:border-gray-200 dark:text-gray-50"
                    : "border-b-2 border-transparent text-gray-600 hover:text-black-400"
                }`}
              >
                For You
              </button>
              {/* "Trending" tab is always present */}
              <button
                onClick={() => handleTabClick("Trending")}
                className={`py-2 mx-2 text-lg font-bold focus:outline-none ${
                  activeTab === "Trending"
                    ? "border-b-2 border-gray-600 text-black-600 dark:border-gray-200 dark:text-gray-50"
                    : "border-b-2 border-transparent text-gray-600 hover:text-black-400"
                }`}
              >
                Trending
              </button>
            </div>
          )}

          {/* Tab Content */}
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
                      <DialogDescription>
                        Create your own market here. Click submit when you're
                        done.
                      </DialogDescription>
                    </DialogHeader>
                    <CreateMarket />
                  </DialogContent>
                </Dialog>
                <p>tweet cards</p>
              </div>
            )}

            {/* Always display Trending content */}
            {(activeTab === "Trending" || !isConnected) && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Trending 🔥</h2>
                <p>
                  Check out what's trending right now in the world of crypto,
                  news, and more!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
