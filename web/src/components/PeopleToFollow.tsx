"use client";
import { CheckCircle, UserPlus} from "lucide-react";

const PeopleToFollow = () => {
  const people = [
    { id: 1, username: "yuga.eth", verified: true },
    { id: 2, username: "yuga.eth", verified: true },
    { id: 3, username: "yuga.eth", verified: true },
    { id: 4, username: "yuga.eth", verified: true },
  ];

  return (
    <div className="bg-white border rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">People to follow</h2>
        <UserPlus className="w-5 h-5 text-indigo-500" />
      </div>
      {people.map((person) => (
        <div key={person.id} className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img
              src="/profile-placeholder.png" // Use a placeholder or actual image URL
              alt={person.username}
              className="w-8 h-8 rounded-full"
            />
            <p className="text-gray-900">{person.username}</p>
            {person.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <button className="bg-indigo-500 text-white rounded-full px-4 py-1 hover:bg-indigo-600 text-sm">
            Follow
          </button>
        </div>
      ))}
    </div>
  );
};

export default PeopleToFollow;
