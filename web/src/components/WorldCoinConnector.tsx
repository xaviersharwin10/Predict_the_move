"use client";

import React, { useEffect, useState } from "react";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";

interface WorldCoinConnectProps {
  onSuccess: (proof: any) => void; // Define the prop type for onSuccess
}

export default function WorldCoinConnect({ onSuccess }: WorldCoinConnectProps) {
  const [worldcoinVerified, setWorldcoinVerified] = useState(false);
  const [worldcoinId, setWorldcoinId] = useState<any>(null);

  // Check localStorage for previous verification data
  useEffect(() => {
    const signature = localStorage.getItem("worldcoinSignature");
    if (signature) {
      setWorldcoinVerified(true);
      const worldcoinSignature = JSON.parse(signature);
      setWorldcoinId({
        nullifier_hash: worldcoinSignature.message,
      });
      console.log("Loaded worldcoin verification from localStorage");
    }
  }, []);

  // Handle the proof verification
  const handleVerify = async (proof: any) => {
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proof }),
    });

    if (!response.ok) {
      throw new Error(`Error verifying Worldcoin: ${response.statusText}`);
    }

    const data = await response.json();
    setWorldcoinVerified(data.verified);
  };

  // Handle signing of the nullifier hash
  const handleSign = async (message: string) => {
    const response = await fetch("/api/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Error signing Worldcoin: ${response.statusText}`);
    }

    const signedMessage = await response.json();

    // Store the signed message in localStorage
    localStorage.setItem(
      "worldcoinSignature",
      JSON.stringify({
        message,
        signature: signedMessage,
      })
    );

    console.log("User is verified and ready for the prediction market.");
  };

  // Success callback after verification
  const internalOnSuccess = async (proof: any) => {
    // Sign and store the nullifier hash
    await handleSign(proof.nullifier_hash);
    setWorldcoinId(proof);
    setWorldcoinVerified(true);

    // Call the onSuccess prop passed from the parent
    if (onSuccess) {
      onSuccess(proof);
    }
  };

  return (
    <>
      {!worldcoinId ? (
        <IDKitWidget
          app_id = "app_846115237895268859dfa22a033bdf53"
          action = "verify-human" // Customize for your market
          onSuccess={internalOnSuccess} // Use internal handler to include prop
          handleVerify={handleVerify} // Optional verify step
          verification_level={VerificationLevel.Device} // Adjust verification level if needed
        >
          {({ open }) => (
            <div
              className="font-bold text-lg pt-1 text-zinc-600 cursor-pointer"
              onClick={open}
            >
              Verify to Join Prediction Market
            </div>
          )}
        </IDKitWidget>
      ) : (
        <div className="text-right mt-1 mr-1">
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            Worldcoin Verified ✅
          </span>
          {worldcoinVerified && (
            <div className="mt-2 text-green-600">
              You are verified! Start participating in markets.
            </div>
          )}
        </div>
      )}
    </>
  );
}
