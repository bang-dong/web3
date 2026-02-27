require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("./tasks/deploy-fundme")
require("hardhat-deploy")
require("@nomicfoundation/hardhat-ethers")
require("ethers")
require("hardhat-deploy-ethers")

const SEPOLIA_URL = process.env.SEPOLIA_URL
const ACCOUNT = process.env.ACCOUNT
const ACCOUNT_1 = process.env.ACCOUNT_1
const API_KEY = process.env.API_KEY 

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    sepolia:{
      url: SEPOLIA_URL,
      accounts:[ACCOUNT,ACCOUNT_1],
      chainId:11155111
    }
  },
  etherscan:{
    apiKey:{
      sepolia:API_KEY
    }
  },
  namedAccounts:{
    firstAccount:{
      default:0
    },
    secondAccount:{
      default:1
    },
  }
};
