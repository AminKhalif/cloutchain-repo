#!/usr/bin/env node

// CLOUTCHAIN API SERVER - Clean, organized architecture
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Import routes
import campaignRoutes from './routes/campaigns.js'
import submissionRoutes from './routes/submissions.js'
import paymentRoutes from './routes/payments.js'

// Import config
import { testConnection } from './config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from root directory
dotenv.config({ path: join(__dirname, '../../.env') })

const app = express()
const PORT = process.env.PORT || process.env.API_PORT || 3001

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

app.use(helmet())
app.use(compression())
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:8081', 
    'http://localhost:8080',
    'https://cloutchain-ui.vercel.app'
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection()
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    version: '1.0.0'
  })
})

// API Routes
app.use('/api/campaigns', campaignRoutes)     // Brand domain
app.use('/api/submissions', submissionRoutes) // Creator domain  
app.use('/api/payments', paymentRoutes)       // Payment domain

// =============================================================================
// BLOCKCHAIN INTEGRATION ROUTES
// =============================================================================

// Create blockchain campaign
app.post('/api/blockchain/create-campaign', async (req, res) => {
  try {
    const { BlockchainService } = await import('./services/blockchainService.js')
    const blockchain = new BlockchainService()
    
    const result = await blockchain.createCampaign(req.body)
    res.json(result)
  } catch (error) {
    console.error('Blockchain campaign creation error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Manual metrics check with blockchain payment
app.post('/api/blockchain/check-metrics', async (req, res) => {
  try {
    const { MetricsCheckerService } = await import('./services/metricsChecker.js')
    const metricsChecker = new MetricsCheckerService()
    
    const result = await metricsChecker.checkSubmissionMetrics(req.body)
    res.json(result)
  } catch (error) {
    console.error('Metrics check error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Test Blai video (quick demo)
app.post('/api/blockchain/test-blai', async (req, res) => {
  try {
    const { MetricsCheckerService } = await import('./services/metricsChecker.js')
    const metricsChecker = new MetricsCheckerService()
    
    const result = await metricsChecker.testBlaiVideo()
    res.json(result)
  } catch (error) {
    console.error('Blai test error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Test blockchain connection
app.get('/api/blockchain/connection', async (req, res) => {
  try {
    const { BlockchainService } = await import('./services/blockchainService.js')
    const blockchain = new BlockchainService()
    
    const result = await blockchain.testConnection()
    res.json(result)
  } catch (error) {
    console.error('Blockchain connection test error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// =============================================================================
// SERVER STARTUP
// =============================================================================

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your Supabase credentials.')
      process.exit(1)
    }

    app.listen(PORT, () => {
      console.log('')
      console.log('🚀 CloutChain API Server Started!')
      console.log('═'.repeat(50))
      console.log(`📡 Server running on: http://localhost:${PORT}`)
      console.log(`🗄️  Database: Connected to Supabase`)
      console.log(`🏗️  Architecture: Clean separation of concerns`)
      console.log('═'.repeat(50))
      console.log('')
      console.log('📋 Available endpoints:')
      console.log('  GET  /health - Health check')
      console.log('')
      console.log('  🏢 BRAND DOMAIN (Campaigns):')
      console.log('    POST /api/campaigns - Create campaign')
      console.log('    GET  /api/campaigns - List campaigns')
      console.log('    GET  /api/campaigns/open - Get open campaigns')
      console.log('    GET  /api/campaigns/:id - Get campaign details')
      console.log('')
      console.log('  🎨 CREATOR DOMAIN (Submissions):')
      console.log('    POST /api/submissions - Create submission')
      console.log('    GET  /api/submissions/creator - Get creator submissions')
      console.log('    GET  /api/submissions/campaign/:id - Get campaign submissions')
      console.log('    POST /api/submissions/:id/update-metrics - Update metrics')
      console.log('')
      console.log('🎯 Ready for hackathon demo!')
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()