import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local .env or root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const RPC_URL = process.env.RPC_URL || process.env.BLOCKCHAIN_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.BLOCKCHAIN_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    testnet: {
      url: RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
