// // scripts/create-box.js
// const { ethers, upgrades } = require("hardhat");
// require("dotenv").config();

// async function main() {
//   const TokenName = await ethers.getContractFactory("TokenName");
//   const tokenName = await upgrades.deployProxy(TokenName, [process.env.UNISWAP_ROUTER_ADDRESS, process.env.PUBLIC_KEY_OWNER_TESTNET]);
//   await tokenName.waitForDeployment();
//   console.log("tokenName deployed to:", await tokenName.getAddress());
// }

// main();


const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const TokenName = await ethers.getContractFactory("TokenName");
  const tokenName = await upgrades.deployProxy(TokenName, [process.env.UNISWAP_ROUTER_ADDRESS, process.env.PUBLIC_KEY_OWNER_TESTNET]);
  await tokenName.deployed();
  console.log("TokenName deployed to:", tokenName.address);
  console.log(await upgrades.erc1967.getImplementationAddress(tokenName.address));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
