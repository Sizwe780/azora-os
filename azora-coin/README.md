# Azora Coin (AZR)

Azora Coin (AZR) is the native blockchain-denominated asset of Azora World, implemented according to Article XII of the Azora Constitution.

## Overview

AZR uses a Proof of Compliance (PoC) minting mechanism, where tokens are minted in response to verified compliance events. The system includes:

- ERC-20 compatible token contract
- Multisig governance for minting operations
- Proof of Compliance verification system
- Crypto Backed Ledger with merkle proofs
- Withdrawal mechanisms with KYC/AML compliance
- Reserve backing with regular attestations

## Architecture

The Azora Coin implementation consists of:

1. **Smart Contracts**:
   - `AzoraCoin.sol`: The main ERC-20 token contract with PoC minting
   - Upgradeable with governance controls
   - Security features including pausing and circuit breakers

2. **Compliance Engine**:
   - `ProofOfCompliance.ts`: Creates and verifies compliance records
   - `CryptoBackedLedger.ts`: Maintains dual-ledger system with merkle proofs
   - `WithdrawalSystem.ts`: Manages fiat off-ramps and P2P trading

3. **Security Features**:
   - Multisig authorization for minting
   - Role-based access control
   - Circuit breakers for abnormal activity
   - Audit hooks and transparency mechanisms

## Getting Started

### Prerequisites

- Node.js v18+
- Hardhat
- MetaMask or other Ethereum wallet

### Installation

```bash
cd azora-coin
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy

```bash
npx hardhat run scripts/deploy.ts --network <network>
```

## Usage

### Minting AZR

AZR is minted through the Proof of Compliance protocol:

1. A compliance event is recorded (KYC verification, merchant onboarding, etc.)
2. AZORA (AI Founder) creates a compliance record with cryptographic proof
3. The record is proposed for minting by AZORA
4. Board members approve the mint proposal
5. Once enough approvals are collected, tokens are minted to the specified address

### Withdrawing AZR

AZR can be withdrawn through multiple mechanisms:

1. **Exchange Partners**: Transfer AZR to approved exchanges
2. **Direct Fiat Payout**: Request withdrawal via integrated payment processors
3. **P2P Marketplace**: Trade directly with other users through the escrow system

## Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  AzoraCoin.sol  │<─────│  Compliance     │<─────│  External       │
│  (ERC-20 Token) │      │  Engine         │      │  Verifiers      │
│                 │      │                 │      │                 │
└────────┬────────┘      └────────┬────────┘      └─────────────────┘
         │                        │
         │                        │
┌────────▼────────┐      ┌────────▼────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Multisig       │      │  Crypto Backed  │<─────│  External       │
│  Governance     │      │  Ledger         │      │  Auditors       │
│                 │      │                 │      │                 │
└────────┬────────┘      └────────┬────────┘      └─────────────────┘
         │                        │
         │                        │
┌────────▼────────┐      ┌────────▼────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Circuit        │      │  Withdrawal     │<─────│  Payment        │
│  Breakers       │      │  System         │      │  Processors     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## License

This project is licensed under the MIT License.

## Compliance

AZR operates in compliance with South African financial regulations, including:

- Financial Intelligence Centre Act (FICA)
- Financial Advisory and Intermediary Services Act (FAIS)
- Financial Markets Act
- Currency and Exchanges Act

## Governance

Changes to the AZR token policy, reserve rules, or critical parameters require approval through the governance process outlined in the Azora Constitution.