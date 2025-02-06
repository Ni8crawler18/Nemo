require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    arbitrum_sepolia: {
      url: process.env.ARBITRUM_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ARBISCAN_API_KEY, // Optional for contract verification
  },
};
