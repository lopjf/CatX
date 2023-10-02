require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-waffle');
require('hardhat-contract-sizer');
require('@onmychain/hardhat-uniswap-v2-deploy-plugin');
require("dotenv").config();
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const { task } = require("hardhat/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
      hardhat: {
        allowUnlimitedContractSize: true,
        gas: 12000000,
        blockGasLimit: 0x1fffffffffffff,
        timeout: 100000000
      },
      localhost: {
        allowUnlimitedContractSize: true,
        gas: 12000000,
        blockGasLimit: 0x1fffffffffffff,
        timeout: 100000000
      },
      eth_testnet: {
        url: process.env.API_URL_SEPOLIA,
        accounts: [process.env.PRIVATE_KEY_TESTNET],
      },
      bsc_testnet: {
        url: process.env.API_URL_BSC_TESTNET,
        accounts: [process.env.PRIVATE_KEY_TESTNET]
      },
      // eth_mainnet: {
      //   url: process.env.API_URL_ETH_MAINNET,
      //   accounts: [process.env.PRIVATE_KEY_MAINNET]
      // },
      // bsc_mainnet: {
      //   url: process.env.API_URL_BSC_MAINNET,
      //   accounts: [process.env.PRIVATE_KEY_MAINNET]
      // },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
};

// command to run the task:
// npx hardhat account --address {YOUR_WALLET_ADDRESS}

task("account", "returns nonce and balance for specified address on multiple networks")
  .addParam("address")
  .setAction(async address => {
    const web3Sepolia = createAlchemyWeb3(process.env.API_URL_ETH_MAINNET);
    const web3BSCTestnet = createAlchemyWeb3(process.env.API_URL_BSC_MAINNET);

    const networkIDArr = ["Ethereum Mainnet:", "BSC Mainnet:"]
    const providerArr = [web3Sepolia, web3BSCTestnet];
    const resultArr = [];
    
    for (let i = 0; i < providerArr.length; i++) {
      const nonce = await providerArr[i].eth.getTransactionCount(address.address, "latest");
      const balance = await providerArr[i].eth.getBalance(address.address)
      resultArr.push([networkIDArr[i], nonce, parseFloat(providerArr[i].utils.fromWei(balance, "ether")).toFixed(2) + "ETH"]);
    }
    resultArr.unshift(["  |NETWORK|   |NONCE|   |BALANCE|  "])
    console.log(resultArr);
  });