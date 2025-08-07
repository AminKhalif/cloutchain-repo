// AI Content Verification Service using Gemini 2.5 Flash
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { TikTokDownloader } from './tiktokDownloader.js'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../../.env') })

export class ContentVerificationService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY
    this.genAI = new GoogleGenerativeAI(this.apiKey)
    this.fileManager = new GoogleAIFileManager(this.apiKey)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  }

  /**
   * Main verification method - analyzes TikTok video against campaign requirements
   */
  async verifyContent(tiktokUrl, campaignData) {
    console.log('🤖 Starting AI content verification with Gemini 2.5 Flash...')
    console.log(`📹 Video: ${tiktokUrl}`)
    console.log(`📋 Campaign: ${campaignData.campaign_name}`)

    let tempVideoPath = null
    let uploadedFile = null

    try {
      // Step 1: Download TikTok video
      console.log('⬇️ Downloading TikTok video...')
      const downloadUrl = await TikTokDownloader.getDownloadUrl(tiktokUrl)
      tempVideoPath = await this._downloadVideo(downloadUrl)
      
      // Step 2: Upload to Gemini File Manager
      console.log('☁️ Uploading to Gemini...')
      uploadedFile = await this.fileManager.uploadFile(tempVideoPath, {
        mimeType: "video/mp4",
        displayName: `verification-${Date.now()}`
      })

      // Wait for processing
      console.log('⏳ Waiting for file processing...')
      await this._waitForFileProcessing(uploadedFile.file.name)

      // Step 3: Generate AI verification prompt
      const verificationPrompt = this._generateVerificationPrompt(campaignData)
      
      // Step 4: Analyze video with Gemini 2.5 Flash
      console.log('🧠 Analyzing content with AI...')
      const result = await this.model.generateContent([
        verificationPrompt,
        {
          fileData: {
            mimeType: uploadedFile.file.mimeType,
            fileUri: uploadedFile.file.uri
          }
        }
      ])

      const response = await result.response
      const aiAnalysis = response.text()
      
      // Step 5: Parse AI response into structured format
      const verificationResult = this._parseAIResponse(aiAnalysis, campaignData)
      
      console.log('✅ AI verification completed')
      console.log(`📊 Overall Score: ${verificationResult.overall_score}`)
      console.log(`✨ Recommendation: ${verificationResult.recommendation}`)
      
      return verificationResult

    } catch (error) {
      console.error('❌ Verification failed:', error.message)
      throw error
    } finally {
      // Cleanup
      if (tempVideoPath && fs.existsSync(tempVideoPath)) {
        fs.unlinkSync(tempVideoPath)
        console.log('🧹 Cleaned up local temp file')
      }
      if (uploadedFile) {
        await this.fileManager.deleteFile(uploadedFile.file.name)
        console.log('🧹 Cleaned up Gemini file')
      }
    }
  }

  /**
   * Download video from URL to temporary file
   */
  async _downloadVideo(downloadUrl) {
    const tempPath = path.join(__dirname, `../../temp_verification_${Date.now()}.mp4`)
    const response = await fetch(downloadUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`)
    }

    const writer = fs.createWriteStream(tempPath)
    response.body.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    console.log(`📥 Video downloaded: ${Math.round(fs.statSync(tempPath).size / 1024)} KB`)
    return tempPath
  }

  /**
   * Wait for file to be processed by Gemini
   */
  async _waitForFileProcessing(fileName, maxWaitTime = 30000) {
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const file = await this.fileManager.getFile(fileName)
        if (file.state === 'ACTIVE') {
          console.log('✅ File processing complete')
          return
        }
        console.log('⏳ File still processing...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.log('⏳ Waiting for file to be ready...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    throw new Error('File processing timeout')
  }

  /**
   * Generate brand-friendly verification prompt for AI
   */
  _generateVerificationPrompt(campaignData) {
    return `You are a brand-friendly content verification AI for influencer marketing campaigns. Your goal is to APPROVE content that positively represents the brand and is relevant to the campaign topic.

CAMPAIGN DETAILS:
- Campaign Name: ${campaignData.campaign_name}
- Description: ${campaignData.campaign_description || 'No description provided'}
- Requirements: ${campaignData.brand_requirements || 'No specific requirements'}
- Target Metrics: ${JSON.stringify(campaignData.target_metrics)}
- Tags: ${campaignData.tags ? campaignData.tags.join(', ') : 'None'}

VERIFICATION PHILOSOPHY - BE GENEROUS AND BRAND-FRIENDLY:
✅ APPROVE if content is:
- On-topic for the brand/industry (even if not perfect)
- Shows authentic engagement with the product space
- Represents the brand positively
- Has decent production quality
- Would be valuable for the brand to associate with

🤔 NEEDS REVIEW only if:
- Content is borderline relevant but unclear
- Has minor issues that could be easily fixed
- Quality is questionable but not terrible

❌ REJECT only if:
- Completely off-topic or irrelevant
- Contains inappropriate/harmful content
- Misrepresents the brand negatively
- Very poor quality or unprofessional

ANALYSIS TASK:
Watch the video and focus on: "Would this content help our brand and would we be happy to have this creator represent us?"

Reference SPECIFIC moments, quotes, and visual elements you observe to prove you actually watched the content.

Provide your response in this exact JSON format (no markdown formatting):

{
  "overall_score": [0-100 numerical score],
  "recommendation": "[approved/needs_review/rejected]",
  "explanation": "[2-3 sentence summary explaining your decision and the main reasons why]",
  "detailed_feedback": {
    "compliance": {
      "score": [0-100],
      "status": "[passed/warning/failed]",
      "explanation": "[Short explanation - max 50 words]"
    },
    "brand_alignment": {
      "score": [0-100],
      "status": "[excellent/good/poor]",
      "explanation": "[Brief analysis - max 50 words]",
      "suggestions": ["[2-3 short suggestions, max 10 words each]"]
    },
    "content_quality": {
      "score": [0-100],
      "status": "[excellent/good/poor]",
      "explanation": "[Brief assessment - max 50 words]",
      "strengths": ["[2-3 short strengths, max 10 words each]"],
      "improvements": ["[2-3 short improvements, max 10 words each]"]
    },
    "requirements_check": {
      "score": [0-100],
      "met_requirements": ["[short items, max 10 words each]"],
      "missing_requirements": ["[short items, max 10 words each]"],
      "explanation": "[Brief assessment - max 50 words]"
    }
  }
}

SCORING GUIDELINES (BE GENEROUS):
- 90-100: Excellent brand-relevant content that positively represents the brand
- 80-89: Good on-topic content with authentic engagement  
- 70-79: Decent content that's relevant to brand/industry
- 60-69: Borderline content - relevant but could be improved
- 0-59: Off-topic, inappropriate, or very poor quality content

RECOMMENDATION LOGIC (FAVOR APPROVAL):
- "approved": Score 70+, on-topic and positive brand representation
- "needs_review": Score 50-69, borderline relevant but has potential  
- "rejected": Score <50, completely off-topic, inappropriate, or harmful

Focus on WHY content passes campaign guidelines rather than nitpicking. Explain how specific video moments prove compliance with brand goals. Be encouraging and highlight what creators did well.`
  }

  /**
   * Parse AI response and ensure proper JSON structure
   */
  _parseAIResponse(aiResponse, campaignData) {
    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Find JSON object in response
      const jsonStart = cleanResponse.indexOf('{')
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd)
      }
      
      const parsed = JSON.parse(cleanResponse)
      
      // Validate and structure the response
      const result = {
        overall_score: Math.min(100, Math.max(0, parsed.overall_score || 0)),
        recommendation: ['approved', 'needs_review', 'rejected'].includes(parsed.recommendation) 
          ? parsed.recommendation : 'needs_review',
        explanation: parsed.explanation || 'Content verification completed by AI.',
        detailed_feedback: {
          compliance: {
            score: Math.min(100, Math.max(0, parsed.detailed_feedback?.compliance?.score || 0)),
            status: parsed.detailed_feedback?.compliance?.status || 'unknown',
            explanation: parsed.detailed_feedback?.compliance?.explanation || 'No compliance analysis provided.'
          },
          brand_alignment: {
            score: Math.min(100, Math.max(0, parsed.detailed_feedback?.brand_alignment?.score || 0)),
            status: parsed.detailed_feedback?.brand_alignment?.status || 'unknown',
            explanation: parsed.detailed_feedback?.brand_alignment?.explanation || 'No brand alignment analysis provided.',
            suggestions: Array.isArray(parsed.detailed_feedback?.brand_alignment?.suggestions) 
              ? parsed.detailed_feedback.brand_alignment.suggestions : []
          },
          content_quality: {
            score: Math.min(100, Math.max(0, parsed.detailed_feedback?.content_quality?.score || 0)),
            status: parsed.detailed_feedback?.content_quality?.status || 'unknown',
            explanation: parsed.detailed_feedback?.content_quality?.explanation || 'No content quality analysis provided.',
            strengths: Array.isArray(parsed.detailed_feedback?.content_quality?.strengths) 
              ? parsed.detailed_feedback.content_quality.strengths : [],
            improvements: Array.isArray(parsed.detailed_feedback?.content_quality?.improvements) 
              ? parsed.detailed_feedback.content_quality.improvements : []
          },
          requirements_check: {
            score: Math.min(100, Math.max(0, parsed.detailed_feedback?.requirements_check?.score || 0)),
            met_requirements: Array.isArray(parsed.detailed_feedback?.requirements_check?.met_requirements) 
              ? parsed.detailed_feedback.requirements_check.met_requirements : [],
            missing_requirements: Array.isArray(parsed.detailed_feedback?.requirements_check?.missing_requirements) 
              ? parsed.detailed_feedback.requirements_check.missing_requirements : [],
            explanation: parsed.detailed_feedback?.requirements_check?.explanation || 'No requirements analysis provided.'
          }
        },
        verification_metadata: {
          processed_at: new Date().toISOString(),
          campaign_id: campaignData.id,
          ai_model: 'gemini-2.5-flash',
          processing_time_ms: Date.now() - this.startTime
        }
      }

      return result

    } catch (error) {
      console.error('❌ Failed to parse AI response:', error.message)
      console.error('Raw AI response:', aiResponse.substring(0, 500) + '...')
      
      // Return fallback response with error details
      return {
        overall_score: 0,
        recommendation: 'needs_review',
        explanation: 'AI analysis encountered a parsing error. Manual review required to ensure quality.',
        detailed_feedback: {
          compliance: { 
            score: 0, 
            status: 'unknown', 
            explanation: 'Unable to complete automated compliance check due to technical error.' 
          },
          brand_alignment: { 
            score: 0, 
            status: 'unknown', 
            explanation: 'Unable to complete automated brand alignment check due to technical error.', 
            suggestions: ['Manual review recommended'] 
          },
          content_quality: { 
            score: 0, 
            status: 'unknown', 
            explanation: 'Unable to complete automated quality assessment due to technical error.', 
            strengths: [], 
            improvements: ['Manual review recommended'] 
          },
          requirements_check: { 
            score: 0, 
            met_requirements: [], 
            missing_requirements: [], 
            explanation: 'Unable to complete automated requirements check due to technical error.' 
          }
        },
        verification_metadata: {
          processed_at: new Date().toISOString(),
          campaign_id: campaignData.id,
          ai_model: 'gemini-2.5-flash',
          error: error.message,
          raw_response_preview: aiResponse.substring(0, 200)
        }
      }
    }
  }
}