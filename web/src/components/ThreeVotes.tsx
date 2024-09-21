import { useState } from "react";
import { Button } from "@/components/ui/button"; // Import from Shadcn
import { Progress } from "@/components/ui/progress";

const ThreeVotes = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [percentage, setPercentage] = useState(60); // Example percentage for progress

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Cast your first 3 votes to get started</h2>
      <p className="text-red-500 mb-4">We'll cover the cost for you ✨</p>

      {/* Poll Section */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <p className="font-semibold">Will $ETH be over $5k by September 2024?</p>
        
        {/* Vote Buttons */}
        <div className="flex justify-between mt-4">
          <Button
            onClick={() => setSelectedOption()}
            variant={selectedOption === "yes" ? "default" : "ghost"}
            className="w-1/2 mr-2"
          >
            Yes
          </Button>
          <Button
            onClick={() => setSelectedOption()}
            variant={selectedOption === "no" ? "default" : "ghost"}
            className="w-1/2 ml-2"
          >
            No
          </Button>
        </div>

        {/* Progress Bar */}
        <Progress value={percentage} className="mt-4" />
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4">
        <span className={`h-2 w-2 rounded-full mx-1 ${true ? "bg-blue-500" : "bg-gray-300"}`} />
        <span className="h-2 w-2 rounded-full mx-1 bg-gray-300" />
        <span className="h-2 w-2 rounded-full mx-1 bg-gray-300" />
      </div>
    </div>
  );
};

export default ThreeVotes;
