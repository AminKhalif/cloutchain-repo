// Test Blai Video AI Content Verification
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function testBlaiVerification() {
  console.log('🤖 Testing Blai Video AI Content Verification')
  console.log('=' .repeat(60))
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY not found')
  }

  const fileManager = new GoogleAIFileManager(apiKey)
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  // Blai campaign data
  const blaiCampaign = {
    id: 'blai-test-123',
    campaign_name: 'Blai App',
    campaign_description: 'Showcase Blaiapp.io - an AI-powered cryptocurrency investment and trading application',
    brand_requirements: 'Highlight AI-powered crypto analysis, trading assistance, portfolio strategy, or wallet features. Show authentic engagement with crypto/AI technology.',
    target_metrics: { views: 50000, likes: 2000, shares: 100 },
    tags: ['crypto', 'AI', 'trading', 'fintech', 'blai']
  }

  const blaiInfo = `Blaiapp.io is an AI-powered cryptocurrency investment and trading application. It's designed to help users, from beginners to experienced investors, make informed decisions in the crypto market.

Key features:
- AI-Powered Analysis: Uses AI to analyze market signals, providing personalized market analysis
- Trading Assistance: AI agents that analyze markets in real-time and make tailored trading decisions  
- Portfolio Strategy: Learns user's risk tolerance and helps build strategies to grow crypto holdings
- Smart Wallet Creation: Create secure crypto wallet directly within the app
- Research and Analyses: Access crypto articles and daily macroeconomic analyses

Blaiapp.io positions itself as a "crypto co-pilot," simplifying crypto investing through conversational AI and automation.`

  let uploadedFile = null

  try {
    // Upload local Blai video
    const videoPath = path.join(__dirname, '../vid_asset', 'blai_vid.mp4')
    console.log(`📹 Uploading Blai video: ${videoPath}`)
    
    uploadedFile = await fileManager.uploadFile(videoPath, {
      mimeType: "video/mp4",
      displayName: "blai-verification-test"
    })

    console.log('✅ Video uploaded successfully')
    console.log(`📄 File URI: ${uploadedFile.file.uri}`)

    // Wait for processing
    console.log('⏳ Waiting for video processing...')
    await waitForProcessing(fileManager, uploadedFile.file.name)

    // Generate verification prompt
    const prompt = `You are a brand-friendly content verification AI for the Blai App influencer marketing campaign. Your goal is to APPROVE content that positively represents Blai and is relevant to crypto/AI.

BRAND INFO:
${blaiInfo}

CAMPAIGN DETAILS:
- Campaign: ${blaiCampaign.campaign_name}
- Description: ${blaiCampaign.campaign_description}  
- Requirements: ${blaiCampaign.brand_requirements}
- Target Metrics: ${JSON.stringify(blaiCampaign.target_metrics)}
- Tags: ${blaiCampaign.tags.join(', ')}

VERIFICATION PHILOSOPHY - BE GENEROUS:
✅ APPROVE if content shows authentic engagement with crypto/AI/Blai and would be valuable brand association
🤔 NEEDS REVIEW only if borderline relevant  
❌ REJECT only if completely off-topic or inappropriate

TASK: Focus on "Would Blai be happy to have this creator represent them?" Use SPECIFIC video evidence to prove why this PASSES campaign guidelines.

Respond in JSON format:
{
  "overall_score": [0-100],
  "recommendation": "[approved/needs_review/rejected]", 
  "explanation": "[2-3 sentence summary of your decision]",
  "video_analysis": {
    "transcript_highlights": ["[key quotes and dialogue you heard]"],
    "visual_elements": ["[specific visual elements, text overlays, props, clothing you observed]"],
    "scene_breakdown": ["[describe specific scenes and moments you witnessed]"],
    "brand_mentions": ["[exact mentions of Blai, app features, or brand elements you observed]"]
  },
  "detailed_feedback": {
    "compliance": {
      "score": [0-100],
      "status": "[passed/warning/failed]",
      "explanation": "[compliance analysis with SPECIFIC examples from the video]",
      "evidence": ["[specific moments/quotes that support this assessment]"]
    },
    "brand_alignment": {
      "score": [0-100], 
      "status": "[excellent/good/poor]",
      "explanation": "[how well content matches Blai brand with SPECIFIC examples]",
      "evidence": ["[specific moments/visuals/quotes that demonstrate brand alignment]"],
      "suggestions": ["[improvement suggestions]"]
    },
    "content_quality": {
      "score": [0-100],
      "status": "[excellent/good/poor]", 
      "explanation": "[production quality assessment with SPECIFIC observations]",
      "evidence": ["[specific visual/audio elements you observed]"],
      "strengths": ["[what creator did well with specific examples]"],
      "improvements": ["[areas for improvement with specific examples]"]
    },
    "requirements_check": {
      "score": [0-100],
      "met_requirements": ["[fulfilled requirements with specific evidence from video]"],
      "missing_requirements": ["[unmet requirements with specific examples]"],
      "explanation": "[requirements compliance with SPECIFIC video evidence]",
      "evidence": ["[specific moments that prove requirements were met or missed]"]
    }
  }
}`

    // Run AI analysis
    console.log('🧠 Analyzing video with Gemini 2.5 Flash...')
    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          mimeType: uploadedFile.file.mimeType,
          fileUri: uploadedFile.file.uri
        }
      }
    ])

    const response = await result.response
    const aiAnalysis = response.text()
    
    // Parse and display results
    console.log('\n🎉 AI ANALYSIS COMPLETE!')
    console.log('=' .repeat(60))
    
    try {
      let cleanResponse = aiAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonStart = cleanResponse.indexOf('{')
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd)
      }
      
      const parsed = JSON.parse(cleanResponse)
      
      console.log(`📊 Overall Score: ${parsed.overall_score}/100`)
      console.log(`✨ Recommendation: ${parsed.recommendation.toUpperCase()}`)
      console.log(`💬 Explanation: ${parsed.explanation}`)
      console.log('')
      
      // Show video analysis evidence
      if (parsed.video_analysis) {
        console.log('🎬 VIDEO ANALYSIS EVIDENCE:')
        if (parsed.video_analysis.transcript_highlights?.length > 0) {
          console.log('  📝 Key Quotes:')
          parsed.video_analysis.transcript_highlights.forEach(quote => console.log(`    • "${quote}"`))
        }
        if (parsed.video_analysis.visual_elements?.length > 0) {
          console.log('  👁️  Visual Elements:')
          parsed.video_analysis.visual_elements.forEach(element => console.log(`    • ${element}`))
        }
        if (parsed.video_analysis.brand_mentions?.length > 0) {
          console.log('  🏷️  Brand Mentions:')
          parsed.video_analysis.brand_mentions.forEach(mention => console.log(`    • ${mention}`))
        }
        console.log('')
      }
      
      console.log('📋 DETAILED BREAKDOWN:')
      console.log(`  🛡️  Compliance: ${parsed.detailed_feedback.compliance.score}/100 (${parsed.detailed_feedback.compliance.status})`)
      console.log(`      ${parsed.detailed_feedback.compliance.explanation}`)
      if (parsed.detailed_feedback.compliance.evidence?.length > 0) {
        console.log('      Evidence:')
        parsed.detailed_feedback.compliance.evidence.forEach(ev => console.log(`        • ${ev}`))
      }
      console.log('')
      
      console.log(`  🎯 Brand Alignment: ${parsed.detailed_feedback.brand_alignment.score}/100 (${parsed.detailed_feedback.brand_alignment.status})`)
      console.log(`      ${parsed.detailed_feedback.brand_alignment.explanation}`)
      if (parsed.detailed_feedback.brand_alignment.evidence?.length > 0) {
        console.log('      Evidence:')
        parsed.detailed_feedback.brand_alignment.evidence.forEach(ev => console.log(`        • ${ev}`))
      }
      console.log('')
      
      console.log(`  🎬 Content Quality: ${parsed.detailed_feedback.content_quality.score}/100 (${parsed.detailed_feedback.content_quality.status})`)
      console.log(`      ${parsed.detailed_feedback.content_quality.explanation}`)
      if (parsed.detailed_feedback.content_quality.evidence?.length > 0) {
        console.log('      Evidence:')
        parsed.detailed_feedback.content_quality.evidence.forEach(ev => console.log(`        • ${ev}`))
      }
      console.log('')
      
      console.log(`  ✅ Requirements Check: ${parsed.detailed_feedback.requirements_check.score}/100`)
      console.log(`      ${parsed.detailed_feedback.requirements_check.explanation}`)
      if (parsed.detailed_feedback.requirements_check.evidence?.length > 0) {
        console.log('      Evidence:')
        parsed.detailed_feedback.requirements_check.evidence.forEach(ev => console.log(`        • ${ev}`))
      }
      
      if (parsed.detailed_feedback.requirements_check.met_requirements?.length > 0) {
        console.log(`      ✅ Met: ${parsed.detailed_feedback.requirements_check.met_requirements.join(', ')}`)
      }
      if (parsed.detailed_feedback.requirements_check.missing_requirements?.length > 0) {
        console.log(`      ❌ Missing: ${parsed.detailed_feedback.requirements_check.missing_requirements.join(', ')}`)
      }
      
      console.log('\n🚀 PIPELINE TEST SUCCESSFUL!')
      
    } catch (parseError) {
      console.log('Raw AI Response:')
      console.log(aiAnalysis)
      throw parseError
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    throw error
  } finally {
    // Cleanup
    if (uploadedFile) {
      await fileManager.deleteFile(uploadedFile.file.name)
      console.log('🧹 Cleaned up uploaded file')
    }
  }
}

async function waitForProcessing(fileManager, fileName, maxWait = 30000) {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    try {
      const file = await fileManager.getFile(fileName)
      if (file.state === 'ACTIVE') {
        console.log('✅ Video processing complete')
        return
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  throw new Error('Video processing timeout')
}

testBlaiVerification()
  .then(() => console.log('\n🎉 All tests passed!'))
  .catch(err => {
    console.error('Test failed:', err)
    process.exit(1)
  })