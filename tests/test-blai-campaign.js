// Test script for Blai crypto campaign analysis
import { AIVerificationService } from './src/services/aiVerification.js'

console.log('🧪 Testing Gemini API connection...')
const connectionTest = await AIVerificationService.testConnection()

if (connectionTest) {
  console.log('\n🎯 Testing video analysis for Blai crypto campaign...')
  
  const blaiCampaignRequirements = {
    campaignName: "Blai AI Crypto Assistant Launch",
    brandName: "Blai",
    industry: "Financial Services - Cryptocurrency",
    targetAudience: "Everyday crypto investors, both new and experienced",
    brandVoice: "Intelligent, transparent, personalized, not hype-driven",
    keyMessages: [
      "AI-powered crypto investing",
      "Making crypto understandable and useful", 
      "Real-time personalized insights",
      "Smarter investing, not hype selling",
      "Multi-agent AI system for market analysis",
      "Mobile-first simplicity"
    ],
    brandValues: [
      "Transparency over hype",
      "Education and clarity", 
      "Intelligent guidance",
      "User empowerment",
      "Community-driven"
    ],
    contentGuidelines: [
      "Must demonstrate understanding of crypto investing challenges",
      "Should highlight AI-powered features or insights",
      "Avoid crypto hype or get-rich-quick messaging",
      "Focus on education and smart investing",
      "Show genuine use case or personal experience"
    ],
    prohibitedContent: [
      "Crypto hype or unrealistic promises",
      "Financial advice without disclaimers", 
      "Gambling-style trading promotion",
      "Misleading investment claims"
    ]
  }
  
  try {
    console.log('📹 Analyzing video:', './vid_asset/tikmate.app_7494816666916752686.mp4')
    console.log('🎯 Campaign:', blaiCampaignRequirements.campaignName)
    
    const analysis = await AIVerificationService.analyzeVideo(
      './vid_asset/tikmate.app_7494816666916752686.mp4',
      blaiCampaignRequirements
    )
    
    console.log('\n📊 AI Analysis Result:')
    console.log('✅ Approved:', analysis.approved)
    console.log('🎯 Confidence:', analysis.confidence + '%')
    console.log('💭 Reasoning:', analysis.reasoning)
    
    if (analysis.issues && analysis.issues.length > 0) {
      console.log('\n⚠️  Issues Found:')
      analysis.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`)
      })
    }
    
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      analysis.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Video analysis failed:', error.message)
  }
} else {
  console.error('❌ Cannot proceed - Gemini API connection failed')
}