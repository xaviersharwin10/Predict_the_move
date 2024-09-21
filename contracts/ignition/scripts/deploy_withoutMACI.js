async function main() {
  const PredictionMarket_withoutMACI = await hre.ethers.getContractFactory(
    "PredictionMarket_withoutMACI"
  );
//   const maciContractAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
  const predictionMarket = await PredictionMarket_withoutMACI.deploy();
  // const predictionMarket = await PredictionMarket.deploy();
  console.log("Testpoint2");
  // Wait for the deployment transaction to be mined
  await predictionMarket.waitForDeployment();
  // await predictionMarket.deployed();
  console.log("PredictionMarket deployed to:", predictionMarket.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });