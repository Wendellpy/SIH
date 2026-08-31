# Blockchain Land Ledger Workspace

EVM-compatible smart contract module for immutable 3D ULPIN cadastral registration and cryptographic verification.

## 1. Environment Setup

Copy `.env.example` to `.env` inside the `blockchain/` directory:

```bash
cp .env.example .env
```

Configure your testnet RPC URL and deployer private key in `blockchain/.env`:

```env
RPC_URL=https://your-evm-testnet-rpc-url
PRIVATE_KEY=your_private_key_without_quotes
```

> **Note**: Never commit or expose your actual private key.

## 2. Compile Contracts

Compile the Solidity smart contracts:

```bash
npx hardhat compile
```

## 3. Run Tests

Execute unit tests verifying property registration, retrieval, and event emissions:

```bash
npx hardhat test
```

## 4. Deploy to Testnet

Deploy `LandLedger.sol` to your configured EVM testnet:

```bash
npx hardhat run scripts/deploy.ts --network testnet
```
