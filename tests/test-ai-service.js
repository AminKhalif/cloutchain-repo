import { AIVerificationService } from './src/services/aiVerification.js'
import path from 'path'

async function testAIService() {
  console.log('🧪 Testing AI Verification Service...')
  
  try {
    // Test connection first
    const connectionTest = await AIVerificationService.testConnection()
    if (!connectionTest) {
      console.error('❌ Connection test failed')
      return
    }
    
    // Test video analysis with sample video
    const videoPath = path.join(process.cwd(), 'vid_asset', 'blai_vid.mp4')
    console.log('📹 Testing video analysis with:', videoPath)
    
    const campaignRequirements = {
      brandName: "Test Brand",
      contentType: "TikTok Video",
      minDuration: 15,
      maxDuration: 60,
      hashtags: ["#testbrand", "#sponsored"],
      guidelines: "Must feature product prominently"
    }
    
    const result = await AIVerificationService.analyzeVideo(videoPath, campaignRequirements)
    
    console.log('✅ AI Analysis Result:')
    console.log(JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAIService()