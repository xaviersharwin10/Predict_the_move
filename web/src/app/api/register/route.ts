// pages/api/register.ts

import { NextApiRequest, NextApiResponse } from "next";

// Simulating a database with an in-memory array (you'll need to replace this with actual DB logic)
const users: { walletAddress: string; username: string; worldcoinVerified: boolean }[] = [];

export default async function register(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { walletAddress, username, worldcoinVerified } = req.body;

    // Basic validation
    if (!walletAddress || !username || typeof worldcoinVerified !== "boolean") {
      return res.status(400).json({ message: "Invalid input data." });
    }

    // Check if the user is already registered
    const existingUser = users.find(user => user.walletAddress === walletAddress);
    if (existingUser) {
    return res.status(400).json({ message: "User already registered." });
    }

    // Register the new user
    const newUser = {
      walletAddress,
      username,
      worldcoinVerified,
    };
    users.push(newUser);

    // Send success response
    console.log("registerd")

    return res.status(200).json({ message: "User registered successfully!", user: newUser });
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }
}
