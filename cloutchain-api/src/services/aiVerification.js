// AI Content Verification Service using Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables (same pattern as database.js)
if (!process.env.RAILWAY_ENVIRONMENT) {
  dotenv.config({ path: join(__dirname, '../../../.env') })
}

const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY

if (!geminiApiKey) {
  throw new Error('Missing GOOGLE_GEMINI_API_KEY environment variable')
}

// Initialize Gemini AI and File Manager
const genAI = new GoogleGenerativeAI(geminiApiKey)
const fileManager = new GoogleAIFileManager(geminiApiKey)

export class AIVerificationService {
  /**
   * Test basic connection to Gemini API
   */
  static async testConnection() {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
      const result = await model.generateContent("Say 'Hello CloutChain AI Agent!'")
      
      console.log('✅ Gemini API connection successful!')
      console.log('Response:', result.response.text())
      return true
    } catch (error) {
      console.error('❌ Gemini API connection failed:', error)
      return false
    }
  }

  /**
   * Upload video file to Gemini File API
   */
  static async uploadVideo(videoPath) {
    try {
      console.log('📤 Uploading video to Gemini File API...')
      
      const uploadResult = await fileManager.uploadFile(videoPath, {
        mimeType: "video/mp4",
        displayName: `cloutchain-video-${Date.now()}`
      })
      
      console.log('✅ Video uploaded successfully:', uploadResult.file.displayName)
      
      // Wait for processing to complete
      let file = await fileManager.getFile(uploadResult.file.name)
      while (file.state === 'PROCESSING') {
        console.log('⏳ Processing video... waiting 10 seconds')
        await new Promise(resolve => setTimeout(resolve, 10000))
        file = await fileManager.getFile(uploadResult.file.name)
      }
      
      if (file.state === 'FAILED') {
        throw new Error('Video processing failed')
      }
      
      console.log('✅ Video processing complete')
      return file
    } catch (error) {
      console.error('❌ Video upload failed:', error)
      throw error
    }
  }

  /**
   * Analyze video content for brand compliance
   */
  static async analyzeVideo(videoPath, campaignRequirements) {
    try {
      // Upload video using File API
      const uploadedFile = await this.uploadVideo(videoPath)
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
      
      const prompt = `
        You are CloutVision, an AI content verification agent for CloutChain that analyzes creator submissions for brand campaigns.
        
        Campaign Information: ${JSON.stringify(campaignRequirements)}
        
        Analyze this video submission using the FULL campaign context - both the campaign description (to understand the brand/product) and the specific content requirements (rules creators must follow).
        
        Respond in this exact JSON format:
        {
          "score": number (0-100),
          "recommendation": "approved" | "needs_review" | "rejected",
          "campaignCompliance": {
            "brandMention": {
              "status": "passed" | "failed" | "partial",
              "message": "Specific finding about brand mentions in the video"
            },
            "topicRelevance": {
              "status": "passed" | "failed" | "partial", 
              "message": "How well the content aligns with the campaign topic/theme based on the description"
            },
            "requirements": {
              "status": "passed" | "failed" | "partial",
              "message": "Assessment of whether specific content requirements were met"
            },
            "callToAction": {
              "status": "passed" | "failed" | "partial",
              "message": "Evaluation of the call-to-action effectiveness for this brand/product"
            }
          },
          "performanceInsights": {
            "audienceMatch": "Analysis of how well this content will reach the target audience for this brand/product",
            "engagementPotential": "Assessment of likely engagement and authenticity of the content",
            "brandPositioning": "How effectively the content positions/represents the brand based on the campaign description"
          },
          "overallAssessment": "Detailed explanation of the overall recommendation referencing both campaign description and requirements"
        }
        
        Be specific and reference actual content from the video. Base your analysis on the complete campaign context provided.
      `
      
      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            mimeType: uploadedFile.mimeType,
            fileUri: uploadedFile.uri
          }
        }
      ])
      
      // Clean up uploaded file after analysis
      await fileManager.deleteFile(uploadedFile.name)
      console.log('🗑️ Cleaned up uploaded file')
      
      return JSON.parse(result.response.text())
    } catch (error) {
      console.error('❌ Video analysis failed:', error)
      throw error
    }
  }
}