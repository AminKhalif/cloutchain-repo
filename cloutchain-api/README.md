# 🔧 CloutChain API & AI Pipeline

**Node.js backend service that powers CloutChain's AI content verification, TikTok integration, and smart contract interaction.**

## 🎯 Overview

This backend serves as the orchestration layer between the React frontend, AI analysis services, blockchain smart contracts, and external APIs. It handles campaign management, content verification workflows, and payment processing automation.

## 🏗️ Architecture

```
cloutchain-api/
├── src/
│   ├── controllers/           # REST API endpoint handlers
│   │   ├── campaigns.js       # Campaign CRUD operations
│   │   ├── submissions.js     # Content submission management
│   │   └── payments.js        # Payment processing & tracking
│   │
│   ├── services/              # Core business logic & integrations
│   │   ├── aiVerification.js  # Google Gemini AI analysis
│   │   ├── tiktokDownloader.js# TikTok content fetching
│   │   ├── blockchainService.js# Smart contract interaction
│   │   ├── metricsChecker.js  # Real-time engagement tracking
│   │   └── PaymentService.js  # Payment automation logic
│   │
│   ├── models/               # Database schemas & validation
│   │   ├── Campaign.js       # Campaign data structure
│   │   ├── Submission.js     # Content submission model
│   │   └── Payment.js        # Payment record structure
│   │
│   ├── routes/               # Express route definitions
│   │   ├── campaigns.js      # Campaign endpoints
│   │   ├── submissions.js    # Submission endpoints
│   │   └── payments.js       # Payment endpoints
│   │
│   └── config/
│       └── database.js       # Supabase connection & setup
│
└── tests/                    # Moved to /tests directory
```

## 🤖 AI Processing Pipeline

### Content Verification Workflow
1. **Content Reception** - Creator submits TikTok URL via API
2. **Video Download** - `tiktokDownloader.js` fetches video content  
3. **AI Analysis** - `aiVerification.js` processes with Google Gemini
4. **Quality Scoring** - AI rates content quality, authenticity, brand alignment
5. **Engagement Prediction** - ML models predict viral potential
6. **Blockchain Verification** - Results stored on-chain for transparency

### AI Services Integration
- **Google Gemini API** - Video content analysis & quality scoring
- **TikTok/RapidAPI** - Engagement metrics & video metadata
- **Content Processing** - Video transcription, visual analysis
- **Fraud Detection** - Bot engagement, fake view identification

## 🔗 API Endpoints

### Campaign Management
```http
GET    /api/campaigns              # List all campaigns
POST   /api/campaigns              # Create new campaign
GET    /api/campaigns/:id          # Get campaign details
PUT    /api/campaigns/:id          # Update campaign
DELETE /api/campaigns/:id          # Delete campaign
```

### Content Submissions  
```http
GET    /api/submissions            # List submissions
POST   /api/submissions            # Submit content for review
GET    /api/submissions/:id        # Get submission details
PUT    /api/submissions/:id/verify # Trigger AI verification
```

### Payment Processing
```http
GET    /api/payments               # Payment history
POST   /api/payments/process       # Execute blockchain payment
GET    /api/payments/:id           # Payment details & status
```

## 🚀 Running Locally

### Prerequisites
```bash
# Required environment variables
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
RAPIDAPI_KEY=your_rapidapi_key
SEPOLIA_PRIVATE_KEY=your_ethereum_private_key
```

### Development Server
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Server runs on http://localhost:3001
```

### Testing AI Pipeline
```bash
# Test AI content analysis
node test-ai-service.js

# Test TikTok video download  
node test-tiktok-pipeline.js

# Test blockchain integration
node test-blockchain-service.js
```

## 🔧 Tech Stack

- **Node.js + Express** - Runtime & web framework
- **Supabase SDK** - Database & real-time subscriptions  
- **Google Gemini API** - AI content analysis
- **Ethers.js** - Ethereum blockchain interaction
- **Axios** - HTTP client for external APIs
- **Multer** - File upload handling
- **dotenv** - Environment configuration

## 🧪 Key Features

### AI-Powered Content Analysis
- Automated video quality assessment
- Brand message alignment scoring  
- Engagement prediction algorithms
- Fraud & authenticity detection

### Smart Contract Integration  
- Automated payment triggering
- Multi-token support (ETH, USDC)
- Gas-optimized transactions
- Payment dispute resolution

### Real-Time Processing
- Live engagement metric updates
- WebSocket connections to frontend
- Asynchronous AI processing pipeline
- Event-driven architecture

## 📊 Performance & Monitoring

- **API Response Times** - Sub-200ms for most endpoints
- **AI Processing** - ~30 seconds average for video analysis  
- **Blockchain Interaction** - Gas-optimized for low fees
- **Database Queries** - Optimized with proper indexing

---

*This backend enables CloutChain's autonomous influencer marketing through AI verification and blockchain automation.*