const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(process.env.PUBLIC_KEY_OWNER_TESTNET);
  await staking.deployed();
  console.log("Staking deployed to:", staking.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
