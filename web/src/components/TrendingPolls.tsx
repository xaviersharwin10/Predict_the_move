"use client";
import { TrendingUp} from 'lucide-react';

const TrendingPolls = () => {
  const polls = [
    { id: 1, hashtag: "#Ethereum", question: "Will $ETH be over $5k by September 2024?", votes: "2k votes" },
    { id: 2, hashtag: "#Web3", question: "Should Farcaster add support for Solana?", votes: "1k votes" },
  ];

  return (
    <div className="bg-white border rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Trending Polls</h2>
        <TrendingUp className="w-5 h-5 text-indigo-500"/>
      </div>
      {polls.map((poll) => (
        <div key={poll.id} className="mb-4">
          <p className="text-sm text-gray-500">{poll.hashtag}</p>
          <h3 className="text-lg font-bold text-gray-900">{poll.question}</h3>
          <p className="text-sm text-gray-500">{poll.votes}</p>
        </div>
      ))}
      {/* Dots navigation */}
      <div className="flex justify-center space-x-2 mt-2">
        <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
        <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
        <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
        <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
      </div>
    </div>
  );
};

export default TrendingPolls;
