// Payment Validator - Validates payment eligibility
export class PaymentValidator {
  /**
   * Check if submission is eligible for payment
   */
  static canProcess(submission) {
    const errors = []
    
    // Already paid check
    if (submission.payment_tx_hash) {
      errors.push('Payment already processed')
    }
    
    // AI verification check
    if (submission.ai_recommendation !== 'approved') {
      errors.push('AI verification not approved')
    }
    
    // Engagement targets check
    if (!this.hasMetTargets(submission)) {
      errors.push('Engagement targets not reached')
    }
    
    // Campaign validation
    if (!submission.campaigns?.reward_amount) {
      errors.push('Invalid campaign reward amount')
    }
    
    return {
      eligible: errors.length === 0,
      errors
    }
  }
  
  /**
   * Check if engagement targets are met
   */
  static hasMetTargets(submission) {
    const current = submission.current_metrics || {}
    const targets = submission.campaigns?.target_metrics || {}
    
    const viewsReached = (current.views || 0) >= (targets.views || 0)
    const likesReached = (current.likes || 0) >= (targets.likes || 0)
    
    return viewsReached && likesReached
  }
}