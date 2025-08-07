# 🚀 How to Run CloutChain

Quick start guide to get your CloutChain project running locally.

## Prerequisites
- Node.js 18+
- npm
- Environment variables configured in `.env`

## Running the Project

### 1. Start the Backend API Server
```bash
cd cloutchain-api
npm run dev
```
- Server starts on: `http://localhost:3001`
- Check health: `http://localhost:3001/health`

### 2. Start the Frontend UI
```bash
cd cloutchain-ui
npm run dev
```
- UI opens in browser (usually `http://localhost:5173`)

## What Each Part Does

**Backend (`cloutchain-api`):**
- Campaign creation and management
- Creator submission handling
- TikTok metrics fetching
- Database operations via Supabase

**Frontend (`cloutchain-ui`):**
- Brand dashboard for creating campaigns
- Creator dashboard for submissions
- Wallet integration
- Real-time UI updates

## Testing the Flow
1. Connect wallet on Brand Dashboard
2. Create a new campaign
3. Switch to Creator Dashboard
4. Submit a TikTok video to the campaign
5. Check submission status

---
*Both servers need to be running simultaneously for full functionality.*