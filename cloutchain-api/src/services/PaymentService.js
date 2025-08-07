// Payment Service - Handles payment processing logic
import { BlockchainService } from './blockchainService.js'
import { Payment } from '../models/Payment.js'
import { PaymentValidator } from './PaymentValidator.js'

export class PaymentService {
  constructor() {
    this.blockchainService = new BlockchainService()
  }
  
  /**
   * Process payment for a submission
   */
  async processPayment(submission) {
    // Validate eligibility
    const validation = PaymentValidator.canProcess(submission)
    if (!validation.eligible) {
      throw new Error(validation.errors.join(', '))
    }
    
    console.log(`💰 Processing payment for submission: ${submission.id}`)
    
    try {
      // Use stored blockchain campaign ID or fallback to 1 for demo
      let blockchainCampaignId = submission.campaigns.blockchain_campaign_id
      if (!blockchainCampaignId) {
        console.log('⚠️ No blockchain campaign ID found, using fallback ID 1 for demo')
        blockchainCampaignId = 1
      }
      
      console.log(`💰 Using blockchain campaign ID: ${blockchainCampaignId}`)
      
      // Execute blockchain payment
      const paymentResult = await this.blockchainService.payCreator(
        blockchainCampaignId,
        submission.creator_address
      )
      
      if (!paymentResult.success) {
        // Handle specific blockchain errors gracefully
        if (paymentResult.error && paymentResult.error.includes('already paid')) {
          throw new Error('Payment already completed for this creator')
        }
        throw new Error(`Blockchain payment failed: ${paymentResult.error}`)
      }
      
      console.log(`✅ Payment successful! TX: ${paymentResult.transactionHash}`)
      
      // Record payment in database
      await Payment.create({
        submissionId: submission.id,
        transactionHash: paymentResult.transactionHash,
        amount: submission.campaigns.reward_amount
      })
      
      return {
        success: true,
        transactionHash: paymentResult.transactionHash,
        amount: submission.campaigns.reward_amount
      }
      
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      throw error
    }
  }

  /**
   * Convert UUID to unique number for blockchain
   */
  _convertUUIDToNumber(uuid) {
    // Remove dashes and take first 8 hex chars, convert to number
    const hex = uuid.replace(/-/g, '').substring(0, 8)
    const number = parseInt(hex, 16)
    console.log(`🔢 Campaign UUID ${uuid} → Blockchain ID ${number}`)
    return number
  }
}