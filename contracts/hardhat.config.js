require("@nomicfoundation/hardhat-toolbox");
// require("@nomiclabs/hardhat-etherscan");
// require("@nomicfoundation/hardhat-verify");

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    airdao: {
      url: "https://network.ambrosus-test.io", 
      chainId: 22040,
      accounts: [process.env.PRIVATE_KEY],
    },
    // hardhat: {
    //   chainId: 31337,
    // },
    // sepolia: {
    //   url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    //   accounts: [process.env.PRIVATE_KEY],
    // },
    // localhost: {
    //   url: "http://127.0.0.1:8545/", // Connect to the local Hardhat node
    //   chainId: 31337,
    // },
  },
};
