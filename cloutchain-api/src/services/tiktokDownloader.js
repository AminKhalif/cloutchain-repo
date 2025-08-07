// TikTok Video Downloader Service using RapidAPI
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') })

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

export class TikTokDownloader {
  /**
   * Get download URL for a TikTok video
   */
  static async getDownloadUrl(videoUrl) {
    try {
      console.log(`🔗 Getting download URL for: ${videoUrl}`)
      
      if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
        throw new Error('RAPIDAPI_KEY not set in environment variables')
      }
      
      const url = new URL('https://tiktok-video-downloader-api.p.rapidapi.com/media')
      url.searchParams.set('videoUrl', videoUrl)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
        },
      })
      
      console.log('📋 API Response Status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📋 API Response Data:', JSON.stringify(data, null, 2))
      
      const { downloadUrl } = data
      
      if (!downloadUrl) {
        throw new Error('No download URL received from API')
      }

      console.log('✅ Download URL obtained')
      return downloadUrl

    } catch (error) {
      console.error('❌ Error fetching download URL:', error.message)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
      throw error
    }
  }

  /**
   * Validate TikTok URL format
   */
  static isValidTikTokUrl(url) {
    const patterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /^https?:\/\/vm\.tiktok\.com\/[\w\d]+/,
      /^https?:\/\/www\.tiktok\.com\/t\/[\w\d]+/
    ]
    
    return patterns.some(pattern => pattern.test(url))
  }
}