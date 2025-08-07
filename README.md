# 🎬 CloutChain

> **Full-stack decentralized platform that automates influencer marketing campaigns using AI content verification, smart contract payments, and real-time TikTok analytics.**

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange.svg)](https://github.com/user/cloutchain)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB.svg)](https://reactjs.org/)
[![Powered by Ethereum](https://img.shields.io/badge/Powered%20by-Ethereum-627EEA.svg)](https://ethereum.org/)

*Revolutionizing creator economy through blockchain automation*

[🚀 Demo](#-demo) • [✨ Features](#-features) • [🏗️ Architecture](#-architecture) • [🛠️ Development](#-development)

</div>

---

## 🌟 Current Overview

CloutChain is a **working full-stack application** that combines blockchain smart contracts, AI content analysis, and real-time TikTok metrics to create autonomous influencer marketing campaigns. Brands create campaigns, creators submit content, AI agents verify authenticity, and smart contracts automatically execute payments.

### 🚀 What It Does Now
- **🤖 AI Content Analysis**: Google Gemini automatically downloads and analyzes TikTok videos for quality, engagement, and authenticity
- **💰 Smart Contract Payments**: Ethereum-based automatic payments triggered by verified performance metrics
- **📊 Real-Time Tracking**: Live engagement monitoring with TikTok API integration  
- **🎯 Campaign Management**: End-to-end workflow from campaign creation to payout
- **🔍 Fraud Detection**: AI-powered authenticity scoring to prevent fake engagement

### 💡 Key Innovation
**Trustless Performance Marketing** - No human verification needed. AI agents analyze content, smart contracts verify conditions, payments execute automatically.

---

## ✨ Core Features

### 🤖 **AI-Powered Content Verification**
- **Google Gemini Integration**: Automated video download and analysis
- **Content Quality Scoring**: AI evaluates video production quality, relevance, and authenticity  
- **Engagement Prediction**: Machine learning models predict viral potential
- **Fraud Detection**: Identifies fake views, bot comments, and purchased engagement

### 💰 **Smart Contract Payment System**  
- **Escrow Automation**: Funds locked until AI verifies content meets criteria
- **Multi-Criteria Payouts**: Combined AI score + engagement thresholds trigger payments
- **Gas Optimization**: Efficient contract design minimizes transaction costs
- **Multi-Token Support**: ETH, USDC, and custom token payments

### 📊 **Real-Time Analytics Dashboard**
- **Live TikTok Metrics**: Views, likes, shares, comments updated in real-time
- **AI Analysis Results**: Content quality scores, authenticity ratings, engagement predictions
- **Campaign Performance**: ROI tracking, creator rankings, campaign success metrics
- **Blockchain Transparency**: All payments and verifications on-chain and auditable

### 🎯 **End-to-End Campaign Management**
- **Brand Portal**: Create campaigns, set budgets, define success criteria  
- **Creator Dashboard**: Browse campaigns, submit content, track earnings
- **Automated Workflow**: From submission → AI analysis → payment completely autonomous
- **Dispute Resolution**: On-chain evidence for any payment disputes

---

## 🏗️ System Architecture

### 🔄 Complete Data Flow
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Brand     │───▶│   Frontend   │───▶│   Backend   │───▶│   Database   │
│  Creates    │    │   (React)    │    │   (Node.js) │    │  (Supabase)  │
│ Campaign    │    │              │    │             │    │              │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                                                │
                                                ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Smart     │◀───│  AI Agent    │◀───│   TikTok    │◀───│   Creator    │
│ Contract    │    │  (Gemini)    │    │     API     │    │  Submits     │
│  Payment    │    │  Analysis    │    │  Downloads  │    │   Video      │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
```

### 📁 Repository Structure
```
cloutchain/
├── 📱 cloutchain-ui/              # React/TypeScript Frontend
│   ├── src/components/            # UI components (dashboards, forms)
│   ├── src/pages/                 # Brand & Creator portals  
│   ├── src/hooks/                 # Blockchain & API integration
│   └── src/lib/                   # Supabase, wallet, utilities
│
├── 🔧 cloutchain-api/             # Node.js Backend & AI Pipeline
│   ├── src/controllers/           # REST API endpoints
│   ├── src/services/              # AI analysis, TikTok integration
│   │   ├── aiVerification.js      # Gemini AI content analysis
│   │   ├── tiktokDownloader.js    # Video download & processing
│   │   ├── blockchainService.js   # Smart contract interaction
│   │   └── metricsChecker.js      # Real-time engagement tracking
│   └── src/models/                # Database schemas
│
├── 📜 cloutchain-contracts/       # Solidity Smart Contracts
│   ├── CloutChainPayments.sol     # Payment escrow & automation
│   └── deploy.js                  # Contract deployment scripts
│
└── 🧪 tests/                      # Test suites for all components
    ├── test-ai-service.js         # AI analysis testing
    ├── test-blockchain-service.js # Smart contract testing
    └── test-*.js                  # API & integration tests
```

### 🏛️ Technical Architecture

#### **Frontend Layer** (`cloutchain-ui/`)
- **React 18 + TypeScript** - Type-safe, modern UI
- **Vite Build System** - Fast development & optimized production builds  
- **TailwindCSS + shadcn/ui** - Professional, responsive design system
- **Wallet Integration** - MetaMask/WalletConnect for blockchain interaction
- **Real-time Updates** - WebSocket connections for live campaign data

#### **API Layer** (`cloutchain-api/`)  
- **Express.js REST API** - Campaign/submission management endpoints
- **Supabase Integration** - PostgreSQL database with real-time subscriptions
- **AI Processing Pipeline** - Google Gemini video analysis automation
- **External API Integration** - TikTok metrics, blockchain interaction
- **Authentication & Authorization** - Secure brand/creator access

#### **AI Agent System** (`cloutchain-api/src/services/`)
- **Content Download** - Automated TikTok video fetching
- **Gemini Analysis** - Video quality, authenticity, engagement scoring  
- **Metrics Verification** - Real-time engagement validation
- **Fraud Detection** - Bot activity and fake engagement identification

#### **Blockchain Layer** (`cloutchain-contracts/`)
- **Ethereum Smart Contracts** - Escrow, payment automation  
- **Multi-Token Support** - ETH, USDC, custom ERC-20 tokens
- **Gas Optimization** - Efficient contract design for low fees
- **Sepolia Testnet** - Development and testing environment

#### **Data Layer** (Supabase)
- **Campaign Management** - Brand requirements, budgets, criteria
- **Submission Tracking** - Creator content, AI scores, payment status
- **Analytics Storage** - Historical performance data, engagement metrics
- **User Management** - Brand/creator profiles, authentication

---

## 🛠️ Development Setup

### 📋 Prerequisites
- **Node.js 18+** - Runtime for frontend and backend
- **PostgreSQL** or **Supabase account** - Database
- **MetaMask wallet** - For blockchain interaction  
- **API Keys** - Google Gemini, TikTok/RapidAPI, Supabase

### 🚀 Complete Setup Guide

#### 1. **Clone Repository**
```bash
git clone https://github.com/AminKhalif/cloutchain-repo.git
cd cloutchain-repo
```

#### 2. **Environment Configuration**
```bash
# Copy template files
cp .env.template .env
cp cloutchain-ui/.env.template cloutchain-ui/.env

# Edit .env files with your actual credentials:
# - SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY
# - GOOGLE_GEMINI_API_KEY  
# - RAPIDAPI_KEY (for TikTok data)
# - SEPOLIA_PRIVATE_KEY (for blockchain)
```

#### 3. **Install Dependencies**
```bash
# Backend API
cd cloutchain-api
npm install

# Frontend UI  
cd ../cloutchain-ui
npm install

# Smart Contracts
cd ../cloutchain-contracts  
npm install
```

#### 4. **Database Setup**
```bash
# If using Supabase:
# 1. Create project at supabase.com
# 2. Run SQL migrations from cloutchain-api/src/config/
# 3. Update .env with your Supabase credentials

# Local PostgreSQL alternative:
createdb cloutchain
```

#### 5. **Deploy Smart Contracts** (Optional)
```bash
cd cloutchain-contracts
# Configure SEPOLIA_PRIVATE_KEY in .env first
npm run deploy
```

#### 6. **Start Development Servers**
```bash
# Terminal 1 - Backend API (localhost:3001)
cd cloutchain-api
npm run dev

# Terminal 2 - Frontend UI (localhost:5173)  
cd cloutchain-ui
npm run dev

# Terminal 3 - AI Processing (if testing AI features)
cd cloutchain-api
node test-ai-service.js
```

### 🧪 Testing the System

```bash
# Test AI pipeline
cd tests
node test-ai-service.js

# Test blockchain integration  
node test-blockchain-service.js

# Test full campaign flow
node test-api-integration.js
```

### 🧪 Tech Stack

#### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Wagmi** - React hooks for Ethereum
- **React Query** - Data fetching and caching

#### Backend
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **Supabase** - Database and authentication
- **Ethers.js** - Ethereum interaction library
- **TikTok API** - Social media data integration

#### Blockchain
- **Solidity** - Smart contract language
- **Ethereum** - Primary blockchain network
- **Polygon** - Layer 2 scaling solution

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Website**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **Discord**: [Coming Soon]
- **Twitter**: [Coming Soon]

---

## ⚠️ Disclaimer

CloutChain is currently in active development. Features and functionality may change. This software is provided "as is" without warranty of any kind. Always do your own research before using any blockchain application.

---

<div align="center">

**Built with ❤️ by the CloutChain Team**

*Empowering creators through blockchain technology*

</div>