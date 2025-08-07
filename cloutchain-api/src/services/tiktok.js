// TikTok Service - Handles TikTok API interactions
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from root directory
dotenv.config({ path: join(__dirname, '../../../.env') })

const APIFY_TOKEN = process.env.APIFY_TOKEN

if (!APIFY_TOKEN) {
  throw new Error('Missing APIFY_TOKEN in environment variables')
}

export class TikTokService {
  /**
   * Fetch analytics for a TikTok video
   */
  static async getVideoAnalytics(videoUrl) {
    try {
      // console.log(`🎵 Fetching analytics for: ${videoUrl}`)
      
      const response = await fetch(
        `https://api.apify.com/v2/acts/clockworks~tiktok-video-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postURLs: [videoUrl] })
        }
      )

      if (!response.ok) {
        throw new Error(`Apify API failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data || data.length === 0) {
        throw new Error('No data found for this TikTok video')
      }

      const video = data[0]
      
      // Return standardized metrics format
      const analytics = {
        id: video.id || 'unknown',
        author: video.authorMeta?.name || video.author || 'unknown',
        description: video.text || video.description || '',
        likes: parseInt(video.diggCount || video.likesCount || 0),
        views: parseInt(video.playCount || video.viewsCount || 0),
        comments: parseInt(video.commentCount || video.commentsCount || 0),
        shares: parseInt(video.shareCount || video.sharesCount || 0),
        fetchedAt: new Date().toISOString(),
        rawData: video // Keep raw data for debugging
      }

      // Analytics fetched successfully
      // console.log('📊 Analytics fetched successfully:')
      // console.log(`  👤 Author: @${analytics.author}`)
      // console.log(`  ❤️  Likes: ${analytics.likes}`)
      // console.log(`  👁️  Views: ${analytics.views}`)
      // console.log(`  💬 Comments: ${analytics.comments}`)
      // console.log(`  🔄 Shares: ${analytics.shares}`)

      return analytics
      
    } catch (error) {
      console.error(`❌ TikTok fetch error: ${error.message}`)
      throw error
    }
  }

  /**
   * Validate if a URL is a valid TikTok video URL
   */
  static isValidTikTokUrl(url) {
    const tiktokPattern = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/i
    return tiktokPattern.test(url)
  }

  /**
   * Extract TikTok video ID from URL
   */
  static extractVideoId(url) {
    try {
      const regex = /\/video\/(\d+)/
      const match = url.match(regex)
      return match ? match[1] : null
    } catch (error) {
      return null
    }
  }

  /**
   * Check if metrics meet campaign targets
   */
  static checkTargetReached(currentMetrics, targetMetrics) {
    for (const [metric, target] of Object.entries(targetMetrics)) {
      if (currentMetrics[metric] < target) {
        return false
      }
    }
    return true
  }
}