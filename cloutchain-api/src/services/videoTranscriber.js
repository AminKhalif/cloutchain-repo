// Video Transcriber - handles speech-to-text using Gemini
import { GoogleGenerativeAI } from '@google/generative-ai'

export class VideoTranscriber {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
  }

  /**
   * Transcribe audio from video using uploaded file URI
   */
  async transcribeVideo(fileUri) {
    try {
      console.log('🎙️ Starting video transcription...')

      const prompt = `
        Please transcribe all spoken words in this video.
        
        Provide the transcription in this JSON format:
        {
          "transcription": "full text of all spoken words",
          "speakerCount": number of different speakers detected,
          "language": "detected language",
          "confidence": "high/medium/low based on audio quality"
        }
        
        If no speech is detected, return:
        {
          "transcription": "",
          "speakerCount": 0,
          "language": "none",
          "confidence": "no_speech_detected"
        }
      `

      const result = await this.model.generateContent([
        prompt,
        {
          fileData: {
            fileUri: fileUri,
            mimeType: "video/mp4"
          }
        }
      ])

      const responseText = result.response.text()
      console.log('📝 Raw transcription response:', responseText)

      // Parse JSON response
      let transcriptionData
      try {
        transcriptionData = JSON.parse(responseText)
      } catch (parseError) {
        // Fallback if JSON parsing fails
        transcriptionData = {
          transcription: responseText,
          speakerCount: 1,
          language: "unknown",
          confidence: "medium"
        }
      }

      console.log('✅ Transcription completed')
      return transcriptionData

    } catch (error) {
      console.error('❌ Video transcription failed:', error.message)
      throw error
    }
  }

  /**
   * Extract key phrases and topics from transcription
   */
  async extractKeyPhrases(transcription) {
    try {
      const prompt = `
        Analyze this video transcription and extract key information:
        
        Transcription: "${transcription}"
        
        Return JSON format:
        {
          "keyPhrases": ["phrase1", "phrase2", "phrase3"],
          "topics": ["topic1", "topic2"],
          "sentiment": "positive/neutral/negative",
          "brandMentions": ["brand1", "brand2"],
          "productMentions": ["product1", "product2"]
        }
      `

      const result = await this.model.generateContent(prompt)
      const responseText = result.response.text()
      
      return JSON.parse(responseText)
    } catch (error) {
      console.error('❌ Key phrase extraction failed:', error.message)
      throw error
    }
  }
}