// Test TikTok Downloader + Google AI File Manager Pipeline
import { TikTokDownloader } from './src/services/tiktokDownloader.js'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

async function testTikTokPipeline() {
  const videoUrl = 'https://www.tiktok.com/@blaiapp/video/7488572886534327598'
  const tempVideoPath = path.join(__dirname, 'temp_tiktok_video.mp4')
  
  console.log('🎬 Testing TikTok Downloader → Google AI File Manager Pipeline')
  console.log('=' .repeat(60))
  console.log(`📹 Target Video: ${videoUrl}`)
  console.log('')
  
  try {
    // Step 1: Validate TikTok URL
    console.log('🔍 Step 1: Validating TikTok URL...')
    if (!TikTokDownloader.isValidTikTokUrl(videoUrl)) {
      throw new Error('Invalid TikTok URL format')
    }
    console.log('✅ URL format is valid')
    
    // Step 2: Get download URL
    console.log('\n📡 Step 2: Getting download URL from TikTok API...')
    const downloadUrl = await TikTokDownloader.getDownloadUrl(videoUrl)
    console.log(`✅ Download URL obtained: ${downloadUrl.substring(0, 50)}...`)
    
    // Step 3: Download the video
    console.log('\n⬇️ Step 3: Downloading video file...')
    const response = await fetch(downloadUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const writer = fs.createWriteStream(tempVideoPath)
    response.body.pipe(writer)
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
    
    const stats = fs.statSync(tempVideoPath)
    console.log(`✅ Video downloaded successfully (${Math.round(stats.size / 1024)} KB)`)
    
    // Step 4: Upload to Google AI File Manager
    console.log('\n☁️ Step 4: Uploading to Google AI File Manager...')
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not found in environment')
    }
    
    const fileManager = new GoogleAIFileManager(apiKey)
    const uploadResult = await fileManager.uploadFile(tempVideoPath, {
      mimeType: "video/mp4",
      displayName: "tiktok-blaiapp-video"
    })
    
    console.log('✅ Upload to Google AI successful!')
    console.log(`📄 File URI: ${uploadResult.file.uri}`)
    console.log(`📝 File Name: ${uploadResult.file.name}`)
    console.log(`📊 Size: ${uploadResult.file.sizeBytes} bytes`)
    console.log(`🎭 MIME Type: ${uploadResult.file.mimeType}`)
    
    // Step 5: Cleanup
    console.log('\n🧹 Step 5: Cleaning up...')
    
    // Delete local temp file
    fs.unlinkSync(tempVideoPath)
    console.log('✅ Local temp file deleted')
    
    // Delete from Google AI File Manager
    await fileManager.deleteFile(uploadResult.file.name)
    console.log('✅ File removed from Google AI File Manager')
    
    console.log('\n🎉 SUCCESS! Complete pipeline working:')
    console.log('   TikTok URL → Download URL → Video File → Google AI File Manager')
    
    return {
      success: true,
      videoUrl,
      downloadUrl,
      uploadedFile: uploadResult.file
    }
    
  } catch (error) {
    console.error('\n❌ PIPELINE ERROR:', error.message)
    
    if (error.response) {
      console.error('HTTP Status:', error.response.status)
      console.error('Response Data:', error.response.data)
    }
    
    // Cleanup temp file if it exists
    if (fs.existsSync(tempVideoPath)) {
      fs.unlinkSync(tempVideoPath)
      console.log('🧹 Cleaned up temp file')
    }
    
    return {
      success: false,
      error: error.message
    }
  }
}

// Run the test
testTikTokPipeline()
  .then(result => {
    if (result.success) {
      console.log('\n✨ Pipeline test completed successfully!')
    } else {
      console.log('\n💥 Pipeline test failed!')
      process.exit(1)
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err)
    process.exit(1)
  })