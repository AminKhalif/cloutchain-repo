// Payment Controller - Handles payment operations
import { Payment } from '../models/Payment.js'

export class PaymentController {
  /**
   * Get payment history for creator
   */
  static async getHistory(req, res) {
    try {
      const { creator_address } = req.query
      
      if (!creator_address) {
        return res.status(400).json({
          success: false,
          error: 'creator_address is required'
        })
      }

      const payments = await Payment.getByCreator(creator_address)
      const totalEarnings = await Payment.getTotalEarnings(creator_address)
      
      res.json({
        success: true,
        data: {
          payments,
          totalEarnings,
          count: payments.length
        }
      })
    } catch (error) {
      console.error('Error fetching payment history:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}