# 📜 CloutChain Smart Contracts

**Ethereum smart contracts powering decentralized, automated payments for AI-verified influencer marketing campaigns.**

## 🎯 Overview

CloutChain's smart contract system enables trustless, automated payments between brands and content creators. Funds are held in escrow until AI verification confirms content quality and engagement thresholds, then payments are executed automatically on-chain.

## 🏗️ Contract Architecture

```
cloutchain-contracts/
├── CloutChainPayments.sol         # Main payment escrow contract
├── deploy.js                      # Deployment script for testnet/mainnet  
├── check-status.js                # Contract interaction utilities
└── test-*.js                      # Contract testing suites
```

## 📋 Core Smart Contract: `CloutChainPayments.sol`

### Contract Features

#### **🔒 Escrow System**
- **Secure Fund Locking** - Campaign budgets locked in contract until conditions met
- **Multi-Campaign Support** - Single contract handles multiple simultaneous campaigns
- **Automated Release** - Funds released automatically when AI verification passes
- **Emergency Withdrawal** - Brand can reclaim funds if campaign cancelled

#### **💰 Payment Automation**  
- **Threshold-Based Payouts** - Payments triggered by AI score + engagement metrics
- **Multi-Token Support** - Native ETH and ERC-20 token payments (USDC, etc.)
- **Gas Optimization** - Efficient code to minimize transaction costs
- **Batch Payments** - Multiple creators paid in single transaction

#### **🤖 AI Integration**
- **Oracle Integration** - Receives verification results from CloutChain API
- **Multi-Criteria Verification** - AI score + engagement thresholds + time requirements
- **Transparent Scoring** - All AI results stored on-chain for disputes
- **Fraud Protection** - Built-in protection against manipulation

## 🔗 Key Functions

### Campaign Management
```solidity
// Create new campaign with escrow
function createCampaign(
    uint256 budget,
    uint256 minAIScore,
    uint256 minViews,
    uint256 deadline
) external payable

// Submit content for verification  
function submitContent(
    uint256 campaignId,
    string calldata tiktokUrl,
    address creator
) external

// AI oracle reports verification results
function verifySubmission(
    uint256 submissionId,
    uint256 aiScore,
    uint256 engagementScore,
    bool isAuthentic
) external onlyOracle
```

### Payment Processing
```solidity
// Automatic payment execution after verification
function processPayment(uint256 submissionId) external

// Emergency withdrawal for brands
function withdrawCampaign(uint256 campaignId) external onlyBrand

// View campaign and payment details
function getCampaignDetails(uint256 campaignId) external view returns (...)
```

## 🚀 Deployment Guide

### Prerequisites
```bash
# Environment setup
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
SEPOLIA_PRIVATE_KEY=your_ethereum_private_key  
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deploy to Sepolia Testnet
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
node deploy.js
# Contract address will be displayed for frontend integration

# Verify on Etherscan (optional)
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Local Development
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run deploy.js --network localhost
```

## 🧪 Testing Contracts

### Unit Tests
```bash
# Test core contract functionality
node test-payment.js

# Test campaign workflow  
node test-campaign.js

# Test AI integration
node test-blockchain-service.js
```

### Integration Testing
```bash
# Test full campaign flow with API
cd ../cloutchain-api
node test-blockchain-service.js
```

## 🔧 Technical Implementation

### Gas Optimization Techniques
- **Packed Structs** - Efficient storage layout to minimize gas costs
- **Batch Operations** - Multiple payments in single transaction
- **Event Logging** - Comprehensive events for off-chain tracking
- **Access Control** - Role-based permissions for security

### Security Features
- **Reentrancy Protection** - OpenZeppelin ReentrancyGuard implementation
- **Access Control** - Only authorized oracles can trigger payments
- **Input Validation** - Comprehensive parameter checking
- **Emergency Stops** - Circuit breaker for critical issues

### Multi-Token Support
```solidity
// Native ETH payments
function createCampaignETH() external payable

// ERC-20 token payments (USDC, etc.)
function createCampaignToken(
    address token,
    uint256 amount
) external

// Automatic token transfers
function processTokenPayment(
    uint256 submissionId,
    address token
) external
```

## 📊 Contract Specifications

### Network Details
- **Testnet**: Ethereum Sepolia  
- **Mainnet**: Ethereum (planned)
- **Layer 2**: Polygon (planned for gas efficiency)

### Current Deployment
```
Sepolia Testnet:
Contract Address: [Deployed via deploy.js]
Block Explorer: https://sepolia.etherscan.io
Gas Limit: ~2M per transaction
```

### Token Support
- **ETH** - Native Ethereum payments
- **USDC** - Stablecoin payments (planned)
- **Custom Tokens** - ERC-20 compatible

## 🎯 Smart Contract Workflow

```
1. Brand creates campaign → Funds locked in escrow
2. Creator submits content → Submission recorded on-chain  
3. AI analyzes content → Verification results posted by oracle
4. Thresholds met → Payment automatically executed
5. Funds released → Creator receives payment instantly
```

## 🔍 On-Chain Transparency

### Public Verification
- **Campaign Details** - All campaign parameters publicly viewable
- **AI Scores** - Verification results stored on-chain
- **Payment History** - Complete transaction audit trail
- **Dispute Evidence** - Immutable record for payment disputes

### Event Logging
```solidity
event CampaignCreated(uint256 campaignId, address brand, uint256 budget);
event ContentSubmitted(uint256 submissionId, address creator, string tiktokUrl);  
event ContentVerified(uint256 submissionId, uint256 aiScore, bool approved);
event PaymentProcessed(uint256 submissionId, address creator, uint256 amount);
```

## 🛡️ Security Auditing

### Best Practices Implemented
- **OpenZeppelin Standards** - Battle-tested security patterns
- **Access Control** - Multi-role permission system
- **Input Validation** - Comprehensive parameter checking
- **Emergency Controls** - Admin functions for critical situations

### Audit Checklist
- [x] Reentrancy protection implemented
- [x] Integer overflow protection (Solidity 0.8+)
- [x] Access control mechanisms
- [x] Event logging for transparency
- [ ] External security audit (planned for mainnet)

---

*These smart contracts enable trustless, automated influencer marketing with AI verification and blockchain transparency.*