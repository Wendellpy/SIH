import { ethers } from "hardhat";

async function main() {
  console.log("Starting LandLedger deployment...");

  const [deployer] = await ethers.getSigners();
  if (deployer) {
    console.log("Deploying contract with account:", deployer.address);
  }

  const LandLedger = await ethers.getContractFactory("LandLedger");
  const landLedger = await LandLedger.deploy();

  await landLedger.waitForDeployment();

  const contractAddress = await landLedger.getAddress();
  console.log("LandLedger successfully deployed to:", contractAddress);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
