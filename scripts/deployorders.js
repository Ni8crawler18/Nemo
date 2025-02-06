const hre = require("hardhat");

async function main() {
  const NemoOrders = await hre.ethers.getContractFactory("NemoOrders");
  const nemoOrders = await NemoOrders.deploy();

  await nemoOrders.deployed();
  console.log(`NemoOrders deployed to: ${nemoOrders.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
