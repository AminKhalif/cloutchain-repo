// Test Gemini File Manager upload
import { GoogleAIFileManager } from '@google/generative-ai/server'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

async function testGeminiUpload() {
  console.log('🚀 Testing Gemini File Manager Upload')
  console.log('=' .repeat(40))
  
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    console.log('API Key:', apiKey ? '✅ Found' : '❌ Missing')
    
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not found in environment')
    }
    
    const fileManager = new GoogleAIFileManager(apiKey)
    
    // Path to test video
    const videoPath = path.join(__dirname, '../vid_asset', 'blai_vid.mp4')
    console.log('Video path:', videoPath)
    
    console.log('\n📤 Uploading video to Gemini...')
    const uploadResult = await fileManager.uploadFile(videoPath, {
      mimeType: "video/mp4",
      displayName: "cloutchain-test-video"
    })
    
    console.log('✅ Upload successful!')
    console.log('File URI:', uploadResult.file.uri)
    console.log('File Name:', uploadResult.file.name)
    console.log('Size:', uploadResult.file.sizeBytes, 'bytes')
    console.log('MIME Type:', uploadResult.file.mimeType)
    
    // Wait a moment, then clean up
    console.log('\n⏳ Waiting 2 seconds before cleanup...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('🗑️ Cleaning up uploaded file...')
    await fileManager.deleteFile(uploadResult.file.name)
    console.log('✅ File deleted successfully')
    
    console.log('\n🎉 SUCCESS! Gemini File Manager is working correctly!')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    if (error.code) {
      console.error('Error Code:', error.code)
    }
    if (error.status) {
      console.error('HTTP Status:', error.status)
    }
  }
}

testGeminiUpload()