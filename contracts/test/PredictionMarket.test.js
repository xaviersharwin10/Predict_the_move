const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionMarket", function () {
  let PredictionMarket;
  let predictionMarket;
  let owner, addr1, addr2;

  beforeEach(async function () {
    PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy();
    await predictionMarket.waitForDeployment();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Market Creation", function () {
    it("Should create a market", async function () {
      const currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;

      // Set the end date to one hour in the future
      const futureEndDate = currentTimestamp + 3600; // 1 hour later
      await predictionMarket.createMarket("Is it going to rain tomorrow?", futureEndDate); // Example timestamp
      const marketDetails = await predictionMarket.getMarketDetails(1);
      
      expect(marketDetails.question).to.equal("Is it going to rain tomorrow?");
      expect(marketDetails.owner).to.equal(owner.address);
      expect(marketDetails.outcome).to.equal(0); // Unresolved
    });

    it("Should fail if end date is in the past", async function () {
      await expect(
        predictionMarket.createMarket("Past market", 1672531199) // Example past timestamp
      ).to.be.revertedWith("End date must be in the future");
    });
  });

  describe("Placing Stakes", function () {
    beforeEach(async function () {
      await predictionMarket.createMarket("Is it going to rain tomorrow?", 1672531199);
    });

    it("Should allow users to place a stake", async function () {
      await predictionMarket.connect(addr1).placeStake(1, true, { value: ethers.utils.parseEther("1.0") });
      const userStake = await predictionMarket.getUserStake(1, addr1.address);
      
      expect(userStake.stake).to.equal(ethers.utils.parseEther("1.0"));
      expect(userStake.votedYes).to.equal(true);
    });

    it("Should fail if stake is placed after market has ended", async function () {
      // Simulate the market ending
      await ethers.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
      await ethers.provider.send("evm_mine"); // Mine the next block
      
      await expect(
        predictionMarket.connect(addr1).placeStake(1, true, { value: ethers.utils.parseEther("1.0") })
      ).to.be.revertedWith("Market has ended");
    });
  });

  describe("Resolving Markets", function () {
    beforeEach(async function () {
      await predictionMarket.createMarket("Is it going to rain tomorrow?", 1672531199);
      await predictionMarket.connect(addr1).placeStake(1, true, { value: ethers.utils.parseEther("1.0") });
      await ethers.provider.send("evm_increaseTime", [3600]); // Increase time
      await ethers.provider.send("evm_mine"); // Mine the next block
    });

    it("Should allow the owner to resolve the market", async function () {
      await predictionMarket.resolveMarket(1, true); // Resolving to Yes
      
      const outcome = await predictionMarket.getMarketOutcome(1);
      expect(outcome).to.equal(1); // Yes
    });

    it("Should fail if non-owner tries to resolve the market", async function () {
      await expect(
        predictionMarket.connect(addr2).resolveMarket(1, true)
      ).to.be.revertedWith("Only the market owner can resolve");
    });
  });

  describe("Claiming Winnings", function () {
    beforeEach(async function () {
      await predictionMarket.createMarket("Is it going to rain tomorrow?", 1672531199);
      await predictionMarket.connect(addr1).placeStake(1, true, { value: ethers.utils.parseEther("1.0") });
      await predictionMarket.connect(addr2).placeStake(1, false, { value: ethers.utils.parseEther("1.0") });
      await ethers.provider.send("evm_increaseTime", [3600]); // Increase time
      await ethers.provider.send("evm_mine"); // Mine the next block
      await predictionMarket.resolveMarket(1, true); // Resolving to Yes
    });

    it("Should allow users to claim winnings", async function () {
      const initialBalance = await ethers.provider.getBalance(addr1.address);
      await predictionMarket.connect(addr1).claimWinnings(1);
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      
      expect(finalBalance).to.be.gt(initialBalance); // User should have more Ether
    });

    it("Should fail if the user did not win", async function () {
      await expect(
        predictionMarket.connect(addr2).claimWinnings(1)
      ).to.be.revertedWith("User did not stake on the winning outcome");
    });
  });
});
