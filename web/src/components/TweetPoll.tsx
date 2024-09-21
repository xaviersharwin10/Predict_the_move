// TweetPoll.tsx
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, MessageCircleIcon, RepeatIcon, BookmarkIcon } from "lucide-react";
import NounsAvatar from "@/components/NounsAvatar";

type Poll = {
  author: string;
  question: string;
  initialYesAmount: number;
  initialNoAmount: number;
  timeLeft: string;
};

export const TweetPoll = ({
  author,
  question,
  initialYesAmount,
  initialNoAmount,
  timeLeft,
  onVote,
}: Poll & { onVote: (vote: string, amount: number, author: string, question: string) => void }) => {
  const [yesAmount, setYesAmount] = useState(initialYesAmount);
  const [noAmount, setNoAmount] = useState(initialNoAmount);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voteAmount, setVoteAmount] = useState<number>(0);
  const [isNounsMode, setIsNounsMode] = useState(false);
  const totalAmount = yesAmount + noAmount;
  const yesPercentage = totalAmount > 0 ? (yesAmount / totalAmount) * 100 : 0;
  const noPercentage = totalAmount > 0 ? (noAmount / totalAmount) * 100 : 0;

  const handleVote = (vote: string) => {
    if (!userVote) {
      setUserVote(vote);
      const amount = voteAmount > 0 ? voteAmount : 0; // Ensure non-negative voting
      if (vote === "yes") {
        setYesAmount(yesAmount + amount);
      } else {
        setNoAmount(noAmount + amount);
      }
      onVote(vote, amount, author, question); // Pass author and question to parent
      setVoteAmount(0); // Reset the input after voting
    }
  };

  // Easter egg: Double-click to toggle Nouns mode
  useEffect(() => {
    const toggleNounsMode = () => setIsNounsMode(!isNounsMode);
    document.addEventListener("dblclick", toggleNounsMode);
    return () => document.removeEventListener("dblclick", toggleNounsMode);
  }, [isNounsMode]);

  return (
    <Card className={`w-full mx-auto mb-4 ${isNounsMode ? "bg-yellow-100" : "bg-white"} dark:bg-gray-800 transition-colors duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          {isNounsMode ? (
            <NounsAvatar seed={1} />
          ) : (
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src="/placeholder-user.jpg" alt={author} />
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
          )}
          <div className="ml-3">
            <p className="font-semibold">{author}</p>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
        </div>
        <p className={`text-lg font-medium mb-4 ${isNounsMode ? "font-pixel" : ""}`}>{question}</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className={`${isNounsMode ? "bg-indigo-300" : "bg-indigo-100"} text-indigo-500`}>Yes</Badge>
            <Badge variant="secondary" className={`${isNounsMode ? "bg-red-300" : "bg-gray-100"} text-gray-500`}>No</Badge>
          </div>

          <div className="relative w-full bg-gray-300 rounded-md h-6 mt-2">
            <div className={`absolute top-0 left-0 h-full ${isNounsMode ? "bg-indigo-600" : "bg-indigo-600"} rounded-l-md`} style={{ width: `${yesPercentage}%` }} />
            <div className={`absolute top-0 right-0 h-full ${isNounsMode ? "bg-black" : "bg-black"} rounded-r-md`} style={{ width: `${noPercentage}%` }} />
            <div className="absolute inset-0 flex justify-between items-center px-4 text-white text-sm font-bold">
              <span>${yesAmount.toLocaleString()}</span>
              <span>${noAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <input
            type="number"
            value={voteAmount}
            onChange={(e) => setVoteAmount(Number(e.target.value))}
            placeholder="Enter amount"
            className="border rounded-md p-2 w-1/3"
          />

          <div>
            <Button onClick={() => handleVote("yes")} disabled={userVote !== null || voteAmount <= 0} className={`${isNounsMode ? "mx-2 bg-indigo-500 hover:bg-indigo-600" : "mx-2"}`}>
              Bet Yes
            </Button>
            <Button onClick={() => handleVote("no")} disabled={userVote !== null || voteAmount <= 0} className={`${isNounsMode ? "bg-red-500 hover:bg-red-600" : ""}`}>
              Bet No
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="text-green-500 mr-2">● live</span>
          <span>Share your opinion by placing a vote with AMB</span>
          <span className="text-sm text-right text-gray-500">{timeLeft} left</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-4 py-2 border-t">
        <Button variant="ghost" size="sm" className="text-gray-500">
          <HeartIcon className="h-4 w-4 mr-1" /> 62
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <MessageCircleIcon className="h-4 w-4 mr-1" /> 10
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <RepeatIcon className="h-4 w-4 mr-1" /> 2 votes mirrored
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <BookmarkIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
