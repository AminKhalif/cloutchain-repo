// Submission Controller - Handles creator submissions
import { Submission } from '../models/Submission.js'
import { Campaign } from '../models/Campaign.js'
import { TikTokService } from '../services/tiktok.js'
import { BlockchainService } from '../services/blockchainService.js'
import { PaymentService } from '../services/PaymentService.js'
import { Payment } from '../models/Payment.js'

export class SubmissionController {
  /**
   * Create a new submission (Creator submits video)
   */
  static async create(req, res) {
    try {
      const {
        campaign_id,
        creator_address,
        tiktok_url
      } = req.body

      // Validate required fields for creator submissions
      if (!campaign_id || !creator_address || !tiktok_url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: campaign_id, creator_address, tiktok_url'
        })
      }

      // Validate TikTok URL format
      if (!TikTokService.isValidTikTokUrl(tiktok_url)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid TikTok URL format'
        })
      }

      // Check if campaign exists and is open
      const campaign = await Campaign.findById(campaign_id)
      if (campaign.status !== 'open') {
        return res.status(400).json({
          success: false,
          error: 'Campaign is not accepting submissions'
        })
      }

      // Create submission
      const submission = await Submission.create({
        campaignId: campaign_id,
        creatorAddress: creator_address,
        tiktokUrl: tiktok_url
      })

      // AI verification should ONLY be triggered manually by user action
      // REMOVED: Auto-triggering AI verification on submission creation

      // DISABLED: Fetch initial TikTok metrics (to save API credits - can be enabled later)
      // try {
      //   console.log('🎵 Fetching initial TikTok metrics for submission...')
      //   const metrics = await TikTokService.getVideoAnalytics(tiktok_url)
      //   
      //   // Update submission with initial metrics
      //   await Submission.update(submission.id, {
      //     current_metrics: metrics
      //   })
      //   
      //   console.log('✅ Initial metrics stored for submission')
      // } catch (metricsError) {
      //   console.warn('⚠️ Could not fetch initial metrics:', metricsError.message)
      // }
      
      console.log('✅ Submission created - AI verification running in background')

      res.status(201).json({
        success: true,
        data: submission,
        message: 'Submission created successfully'
      })

    } catch (error) {
      console.error('Error creating submission:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Get submissions for a campaign (Brand view)
   */
  static async getByCampaign(req, res) {
    try {
      const submissions = await Submission.findByCampaign(req.params.campaignId)
      
      res.json({
        success: true,
        data: submissions,
        count: submissions.length
      })
    } catch (error) {
      console.error('Error fetching campaign submissions:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Get submissions by creator (Creator view)
   */
  static async getByCreator(req, res) {
    try {
      const { creator_address } = req.query
      
      if (!creator_address) {
        return res.status(400).json({
          success: false,
          error: 'creator_address is required'
        })
      }

      const submissions = await Submission.findByCreator(creator_address)
      
      res.json({
        success: true,
        data: submissions,
        count: submissions.length
      })
    } catch (error) {
      console.error('Error fetching creator submissions:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Update submission metrics and check targets
   */
  static async updateMetrics(req, res) {
    try {
      const submissionId = req.params.id
      
      // Get submission details
      const submission = await Submission.findById(submissionId)
      
      // Fetch current TikTok metrics
      console.log(`🎵 Updating metrics for submission: ${submissionId}`)
      const metrics = await TikTokService.getVideoAnalytics(submission.tiktok_url)
      
      // Check if targets are reached
      const targetReached = TikTokService.checkTargetReached(
        metrics, 
        submission.campaigns.target_metrics
      )
      
      // Update submission with new metrics
      const updateData = {
        current_metrics: metrics,
        last_checked: new Date().toISOString()
      }

      if (targetReached && !submission.payment_tx_hash) {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
        console.log('🎯 Target reached! Triggering blockchain payment...')
        
        // Process blockchain payment
        try {
          const blockchainService = new BlockchainService()
          const paymentResult = await blockchainService.payCreator(
            submission.campaigns.blockchain_campaign_id || 1, // Use blockchain campaign ID
            submission.creator_address
          )
          
          if (paymentResult.success) {
            console.log('💰 Payment successful! TX:', paymentResult.transactionHash)
            // Record payment using Payment model
            await Payment.create({
              submissionId: submissionId,
              transactionHash: paymentResult.transactionHash,
              amount: submission.campaigns.reward_amount
            })
          } else {
            console.error('❌ Payment failed:', paymentResult.error)
          }
        } catch (error) {
          console.error('❌ Blockchain payment error:', error)
        }
      }

      const updatedSubmission = await Submission.update(submissionId, updateData)

      res.json({
        success: true,
        data: {
          submission: { ...updatedSubmission, campaigns: submission.campaigns }, // Include campaigns data
          metrics,
          target_reached: targetReached
        }
      })

    } catch (error) {
      console.error('Error updating submission metrics:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Get single submission by ID
   */
  static async getById(req, res) {
    try {
      const submission = await Submission.findById(req.params.id)
      
      res.json({
        success: true,
        data: submission
      })
    } catch (error) {
      console.error('Error fetching submission:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }


  /**
   * Run AI verification on a submission
   */
  static async runAIVerification(req, res) {
    try {
      const submissionId = req.params.id
      
      console.log(`🤖 AI verification requested for submission: ${submissionId}`)
      
      const result = await Submission.runAIVerification(submissionId)
      
      res.json({
        success: true,
        data: result,
        message: 'AI verification completed successfully'
      })

    } catch (error) {
      console.error('Error running AI verification:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Process payment for submission (no TikTok API calls)
   */
  static async processPayment(req, res) {
    try {
      const submissionId = req.params.id
      
      // Get submission data
      const submission = await Submission.findById(submissionId)
      
      // Delegate to payment service
      const paymentService = new PaymentService()
      const result = await paymentService.processPayment(submission)
      
      res.json({
        success: true,
        data: result,
        message: 'Payment processed successfully'
      })
      
    } catch (error) {
      console.error('Error in payment processing:', error)
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Delete submission by ID
   */
  static async delete(req, res) {
    try {
      const submissionId = req.params.id
      
      // Get submission to verify ownership (optional security check)
      const submission = await Submission.findById(submissionId)
      
      // Delete the submission
      await Submission.delete(submissionId)
      
      console.log(`🗑️ Submission deleted: ${submissionId}`)
      
      res.json({
        success: true,
        message: 'Submission deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting submission:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}