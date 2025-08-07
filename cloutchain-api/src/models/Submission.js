// Submission Model - Handles creator submissions
import { supabase } from '../config/database.js'
import { ContentVerificationService } from '../services/contentVerification.js'

export class Submission {
  /**
   * Create a creator submission for a campaign
   */
  static async create(submissionData) {
    const { data, error } = await supabase
      .from('creator_submissions')
      .insert([{
        campaign_id: submissionData.campaignId,
        creator_address: submissionData.creatorAddress,
        tiktok_url: submissionData.tiktokUrl,
        status: 'submitted',
        ai_verification_status: 'pending'
      }])
      .select(`
        *,
        campaigns (
          campaign_name,
          campaign_description,
          target_metrics,
          reward_amount,
          brand_image_url,
          brand_address
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to create submission: ${error.message}`)
    }

    console.log(`✅ Submission created: ${data.id}`)
    return data
  }

  /**
   * Get submissions for a campaign
   */
  static async findByCampaign(campaignId) {
    const { data, error } = await supabase
      .from('creator_submissions')
      .select(`
        *,
        campaigns (
          campaign_name,
          target_metrics,
          reward_amount
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get submissions: ${error.message}`)
    }

    return data
  }

  /**
   * Get submissions by creator
   */
  static async findByCreator(creatorAddress) {
    const { data, error } = await supabase
      .from('creator_submissions')
      .select(`
        *,
        campaigns (
          campaign_name,
          campaign_description,
          target_metrics,
          reward_amount
        )
      `)
      .eq('creator_address', creatorAddress)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get creator submissions: ${error.message}`)
    }

    return data
  }

  /**
   * Update submission
   */
  static async update(submissionId, updates) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('creator_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update submission: ${error.message}`)
    }

    console.log(`📝 Submission updated: ${submissionId}`)
    return data
  }

  /**
   * Get submission by ID
   */
  static async findById(submissionId) {
    const { data, error } = await supabase
      .from('creator_submissions')
      .select(`
        *,
        campaigns (
          campaign_name,
          target_metrics,
          reward_amount,
          brand_address,
          blockchain_campaign_id
        )
      `)
      .eq('id', submissionId)
      .single()

    if (error) {
      throw new Error(`Failed to get submission: ${error.message}`)
    }

    return data
  }

  /**
   * Run AI verification on a submission
   */
  static async runAIVerification(submissionId) {
    try {
      console.log(`🤖 Starting AI verification for submission: ${submissionId}`)
      
      // Get submission with campaign data
      const submission = await this.findById(submissionId)
      const campaignData = {
        id: submission.campaign_id,
        campaign_name: submission.campaigns.campaign_name,
        campaign_description: submission.campaigns.campaign_description,
        brand_requirements: submission.campaigns.brand_requirements,
        target_metrics: submission.campaigns.target_metrics,
        tags: submission.campaigns.tags
      }

      // Update status to processing
      await this.update(submissionId, {
        ai_verification_status: 'processing'
      })

      // Run AI verification
      const verificationService = new ContentVerificationService()
      const verificationResult = await verificationService.verifyContent(
        submission.tiktok_url,
        campaignData
      )

      // Update submission with verification results
      const updates = {
        ai_verification_status: 'completed',
        ai_verification_result: verificationResult,
        ai_overall_score: verificationResult.overall_score,
        ai_recommendation: verificationResult.recommendation,
        ai_explanation: verificationResult.explanation,
        verification_processed_at: new Date().toISOString()
      }

      // Auto-update submission status based on AI recommendation
      if (verificationResult.recommendation === 'approved') {
        updates.status = 'ai_approved'
      } else if (verificationResult.recommendation === 'rejected') {
        updates.status = 'ai_rejected'
      } else {
        updates.status = 'needs_review'
      }

      const updatedSubmission = await this.update(submissionId, updates)
      
      console.log(`✅ AI verification completed for submission ${submissionId}`)
      console.log(`📊 Score: ${verificationResult.overall_score}, Recommendation: ${verificationResult.recommendation}`)
      
      return updatedSubmission

    } catch (error) {
      console.error(`❌ AI verification failed for submission ${submissionId}:`, error.message)
      
      // Update submission with error status
      await this.update(submissionId, {
        ai_verification_status: 'failed',
        ai_verification_error: error.message,
        verification_processed_at: new Date().toISOString()
      })
      
      throw error
    }
  }

  /**
   * Get submissions pending AI verification
   */
  static async findPendingVerification() {
    const { data, error } = await supabase
      .from('creator_submissions')
      .select(`
        *,
        campaigns (
          campaign_name,
          campaign_description,
          brand_requirements,
          target_metrics,
          tags
        )
      `)
      .eq('ai_verification_status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get pending submissions: ${error.message}`)
    }

    return data
  }

  /**
   * Delete submission by ID
   */
  static async delete(submissionId) {
    const { error } = await supabase
      .from('creator_submissions')
      .delete()
      .eq('id', submissionId)

    if (error) {
      throw new Error(`Failed to delete submission: ${error.message}`)
    }

    console.log(`🗑️ Submission deleted from database: ${submissionId}`)
    return true
  }
}