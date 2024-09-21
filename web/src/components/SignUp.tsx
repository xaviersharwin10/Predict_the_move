"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import WorldCoinConnect from "@/components/WorldCoinConnector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Register = () => {
  const { isConnected, address } = useAccount();
  const [username, setUsername] = useState("");
  const [worldcoinVerified, setWorldcoinVerified] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Wallet Connect, 1: Worldcoin Verify, 2: Username
  const [isRegistered, setIsRegistered] = useState(false); // Track registration status

  useEffect(() => {
    // Check if the user is already registered
    const userRegistered = localStorage.getItem("isRegistered");
    if (userRegistered) {
      setIsRegistered(true);
    }
  }, []);

  const handleWorldcoinSuccess = (proof: any) => {
    setWorldcoinVerified(true);
    setCurrentStep(2); // Move to username entry
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      setError("Please connect your wallet.");
      return;
    }

    if (!username) {
      setError("Please enter a username.");
      return;
    }

    if (!worldcoinVerified) {
      setError("Please complete the Worldcoin verification.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Make API call to register the user in the dApp
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          username,
          worldcoinVerified,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register user.");
      }

      // Mark user as registered
      localStorage.setItem("isRegistered", "true");
      alert("User registered successfully!");
      setIsDialogOpen(false); // Close dialog after successful registration
    } catch (err) {
      console.error(err);
      setError("Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpClick = () => {
    if (isRegistered) {
      alert("You have already signed up!"); // Alert if already registered
      return;
    }
    setIsDialogOpen(true);
    setCurrentStep(0); // Ensure starting at wallet connect step
  };

  // Only move to Worldcoin verification after wallet is connected
  useEffect(() => {
    if (isConnected && currentStep === 0) {
      setCurrentStep(1); // Automatically move to Worldcoin verification after connecting
    }
  }, [isConnected, currentStep]);

  return (
    <div>
      {/* Single Sign Up Button */}
      <Button onClick={handleSignUpClick}>
        Sign Up
      </Button>

      {/* Registration Dialog */}
      <Dialog  open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStep === 0
                ? "Connect Wallet"
                : currentStep === 1
                ? "Worldcoin Verification"
                : "Enter Username"}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 0
                ? "Please connect your wallet to proceed."
                : currentStep === 1
                ? "Please complete the Worldcoin verification to proceed."
                : "Please enter your username to complete registration."}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Wallet Connect */}
          {currentStep === 0 && (
            <div className="mb-4">
              <ConnectButton />
            </div>
          )}

          {/* Step 2: Worldcoin Verification */}
          {currentStep === 1 && isConnected && (
            <>
              <WorldCoinConnect  onSuccess={handleWorldcoinSuccess} />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </>
          )}

          {/* Step 3: Username Input */}
          {currentStep === 2 && (
            <>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isConnected || !worldcoinVerified}
                  className="w-full"
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
