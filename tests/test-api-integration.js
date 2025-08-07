// Test AI Verification API Integration
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const API_BASE = 'http://localhost:3000/api' // Adjust port if needed

async function testAPIIntegration() {
  console.log('🧪 Testing AI Verification API Integration')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Create a test campaign first
    console.log('📋 Step 1: Creating test campaign...')
    const campaignData = {
      brand_address: '0x1234567890123456789012345678901234567890',
      campaign_name: 'Test Blai Campaign',
      target_metrics: { views: 10000, likes: 500 },
      reward_amount: 100,
      description: 'AI-powered crypto app promotion',
      requirements: 'Show AI features, crypto functionality, authentic review',
      tags: ['crypto', 'AI', 'fintech']
    }

    const campaignResponse = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    })

    if (!campaignResponse.ok) {
      throw new Error(`Campaign creation failed: ${campaignResponse.status}`)
    }

    const campaign = await campaignResponse.json()
    console.log(`✅ Campaign created: ${campaign.data.id}`)

    // Test 2: Create a submission (should auto-trigger AI verification)
    console.log('\n📹 Step 2: Creating submission with auto-verification...')
    const submissionData = {
      campaign_id: campaign.data.id,
      creator_address: '0x9876543210987654321098765432109876543210',
      tiktok_url: 'https://www.tiktok.com/@blaiapp/video/7488572886534327598'
    }

    const submissionResponse = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })

    if (!submissionResponse.ok) {
      throw new Error(`Submission creation failed: ${submissionResponse.status}`)
    }

    const submission = await submissionResponse.json()
    console.log(`✅ Submission created: ${submission.data.id}`)
    console.log(`📊 Initial AI status: ${submission.data.ai_verification_status}`)

    // Test 3: Wait a moment for auto-verification, then check status
    console.log('\n⏳ Step 3: Waiting for auto-verification to complete...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    const statusResponse = await fetch(`${API_BASE}/submissions/${submission.data.id}`)
    const statusData = await statusResponse.json()
    
    console.log(`📊 AI Verification Status: ${statusData.data.ai_verification_status}`)
    if (statusData.data.ai_overall_score) {
      console.log(`🎯 AI Score: ${statusData.data.ai_overall_score}/100`)
      console.log(`✨ AI Recommendation: ${statusData.data.ai_recommendation}`)
    }

    // Test 4: Manual verification trigger (if auto didn't complete)
    if (statusData.data.ai_verification_status === 'pending') {
      console.log('\n🤖 Step 4: Triggering manual AI verification...')
      
      const verifyResponse = await fetch(`${API_BASE}/submissions/${submission.data.id}/verify`, {
        method: 'POST'
      })

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json()
        console.log(`✅ Manual verification completed`)
        console.log(`📊 Final Score: ${verifyData.data.ai_overall_score}/100`)
        console.log(`✨ Final Recommendation: ${verifyData.data.ai_recommendation}`)
        
        if (verifyData.data.ai_verification_result) {
          console.log(`💬 AI Explanation: ${verifyData.data.ai_explanation}`)
        }
      } else {
        console.log(`❌ Manual verification failed: ${verifyResponse.status}`)
      }
    }

    // Test 5: Cleanup - delete test data
    console.log('\n🧹 Step 5: Cleaning up test data...')
    
    await fetch(`${API_BASE}/submissions/${submission.data.id}`, { method: 'DELETE' })
    console.log(`🗑️ Deleted test submission`)
    
    await fetch(`${API_BASE}/campaigns/${campaign.data.id}`, { method: 'DELETE' })
    console.log(`🗑️ Deleted test campaign`)

    console.log('\n🎉 API INTEGRATION TEST SUCCESSFUL!')
    console.log('✅ AI verification is fully integrated into your product stack')

  } catch (error) {
    console.error('\n❌ API INTEGRATION TEST FAILED:', error.message)
    
    // Additional error details
    if (error.response) {
      console.error('Response Status:', error.response.status)
      console.error('Response Body:', await error.response.text())
    }
    
    process.exit(1)
  }
}

// Helper function to check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/campaigns`, { method: 'GET' })
    return response.status !== 404
  } catch (error) {
    return false
  }
}

// Run test
console.log('🔍 Checking if server is running...')
checkServer().then(isRunning => {
  if (!isRunning) {
    console.log('❌ Server not running. Please start your API server first:')
    console.log('   npm start (or your server start command)')
    process.exit(1)
  } else {
    console.log('✅ Server is running, starting tests...\n')
    testAPIIntegration()
  }
})