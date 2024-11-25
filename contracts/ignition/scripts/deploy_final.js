async function main() {
    const FinalPredictionMarket = await hre.ethers.getContractFactory(
      "FinalPredictionMarket"
    );
    // const maciContractAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    // const predictionMarket = await PredictionMarket.deploy(maciContractAddress);
    
    // const predictionMarket = await PredPictionMarket.deploy();
    const finalpredictionMarket = await FinalPredictionMarket.deploy();
    console.log("Testpoint2");
    // Wait for the deployment transaction to be mined
    await finalpredictionMarket.waitForDeployment();
    // await predictionMarket.deployed();
    console.log("Final PredictionMarket deployed to:", finalpredictionMarket.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  