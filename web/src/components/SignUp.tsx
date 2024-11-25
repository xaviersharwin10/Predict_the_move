"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const userRegistered = localStorage.getItem("isRegistered");
    if (userRegistered) {
      setIsRegistered(true);
    }
  }, []);

  const handleWorldcoinSuccess = (proof: any) => {
    setWorldcoinVerified(true);
    setCurrentStep(2);
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

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register user.");
      }

      localStorage.setItem("isRegistered", "true");
      alert("User registered successfully!");
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpClick = () => {
    if (isRegistered) {
      alert("You have already signed up!");
      return;
    }
    setIsDialogOpen(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isConnected && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [isConnected, currentStep]);

  return (
    <div>
      <Button onClick={handleSignUpClick}>
        {isConnected ? "Wallet Connected" : "Sign Up"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStep === 0
                ? "Connect Wallet"
                : "Enter Username"}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 0
                ? "Please connect your wallet to proceed."
                :"Please enter your username to complete registration."}
            </DialogDescription>
          </DialogHeader>

          {currentStep === 0 && (
            <div className="mb-4">
              <ConnectButton />
            </div>
          )}

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