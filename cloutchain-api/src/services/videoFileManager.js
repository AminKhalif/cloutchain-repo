// Video File Manager - handles Google AI File uploads
import { GoogleAIFileManager } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

export class VideoFileManager {
  constructor(apiKey) {
    this.fileManager = new GoogleAIFileManager(apiKey)
  }

  /**
   * Upload video file to Google AI and return file URI
   */
  async uploadVideo(videoPath) {
    try {
      // Validate file exists
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`)
      }

      // Check file size (Google limit is 2GB, but let's be conservative)
      const stats = fs.statSync(videoPath)
      const fileSizeInMB = stats.size / (1024 * 1024)
      
      if (fileSizeInMB > 100) {
        throw new Error(`Video file too large: ${fileSizeInMB.toFixed(2)}MB. Recommended maximum: 100MB`)
      }

      console.log(`📤 Uploading video: ${path.basename(videoPath)} (${fileSizeInMB.toFixed(2)}MB)`)

      // Upload to Google AI
      const uploadResult = await this.fileManager.uploadFile(videoPath, {
        mimeType: "video/mp4",
        displayName: path.basename(videoPath)
      })

      console.log(`✅ Upload successful. File URI: ${uploadResult.file.uri}`)
      
      return {
        uri: uploadResult.file.uri,
        name: uploadResult.file.name,
        sizeBytes: uploadResult.file.sizeBytes,
        mimeType: uploadResult.file.mimeType
      }

    } catch (error) {
      console.error('❌ Video upload failed:', error.message)
      throw error
    }
  }

  /**
   * Delete uploaded file from Google AI
   */
  async deleteFile(fileName) {
    try {
      await this.fileManager.deleteFile(fileName)
      console.log(`🗑️ Deleted file: ${fileName}`)
    } catch (error) {
      console.error('❌ File deletion failed:', error.message)
      throw error
    }
  }

  /**
   * List uploaded files
   */
  async listFiles() {
    try {
      const files = await this.fileManager.listFiles()
      return files.files || []
    } catch (error) {
      console.error('❌ File listing failed:', error.message)
      throw error
    }
  }
}