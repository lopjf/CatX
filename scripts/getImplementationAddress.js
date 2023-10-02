const { upgrades } = require("hardhat");

async function main() {
    console.log(await upgrades.erc1967.getImplementationAddress("0xEbAe80bE01b972E9b40390813E01f40c5CB4C4BF"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
