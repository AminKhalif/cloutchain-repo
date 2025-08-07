// Payment Model - Handles payment operations
import { supabase } from '../config/database.js'

export class Payment {
  /**
   * Record a payment transaction
   */
  static async create(paymentData) {
    const { data, error } = await supabase
      .from('creator_submissions')
      .update({
        payment_tx_hash: paymentData.transactionHash,
        payment_amount: paymentData.amount,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.submissionId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to record payment: ${error.message}`)
    }

    console.log(`💰 Payment recorded: ${paymentData.transactionHash}`)
    return data
  }

  /**
   * Get payment history for creator
   */
  static async getByCreator(creatorAddress) {
    const { data, error } = await supabase
      .from('creator_submissions')
      .select(`
        id,
        payment_tx_hash,
        payment_amount,
        payment_date,
        status,
        campaigns (
          campaign_name,
          brand_address
        )
      `)
      .eq('creator_address', creatorAddress)
      .not('payment_tx_hash', 'is', null)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to get payment history: ${error.message}`)
    }

    return data
  }

  /**
   * Get total earnings for creator
   */
  static async getTotalEarnings(creatorAddress) {
    const { data, error } = await supabase
      .from('creator_submissions')
      .select('payment_amount')
      .eq('creator_address', creatorAddress)
      .not('payment_amount', 'is', null)

    if (error) {
      throw new Error(`Failed to get total earnings: ${error.message}`)
    }

    const total = data.reduce((sum, payment) => sum + parseFloat(payment.payment_amount || 0), 0)
    return total
  }
}