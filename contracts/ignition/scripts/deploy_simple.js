async function main() {
  const SimplePredictionMarket = await hre.ethers.getContractFactory(
    "SimplePredictionMarket"
  );
  // const maciContractAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
  // const predictionMarket = await PredictionMarket.deploy(maciContractAddress);
  
  // const predictionMarket = await PredPictionMarket.deploy();
  const simplepredictionMarket = await SimplePredictionMarket.deploy();
  console.log("Testpoint2");
  // Wait for the deployment transaction to be mined
  await simplepredictionMarket.waitForDeployment();
  // await predictionMarket.deployed();
  console.log("Simple PredictionMarket deployed to:", simplepredictionMarket.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
