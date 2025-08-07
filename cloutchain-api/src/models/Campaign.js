// Campaign Model - Handles campaign data operations
import { supabase } from '../config/database.js'

export class Campaign {
  /**
   * Create a new campaign (Brand Domain)
   */
  static async create(campaignData) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        brand_address: campaignData.brandAddress,
        campaign_name: campaignData.campaignName,
        target_metrics: campaignData.targetMetrics,
        reward_amount: campaignData.rewardAmount,
        campaign_description: campaignData.description || '',
        brand_requirements: campaignData.requirements,
        tags: campaignData.tags || [],
        brand_image_url: campaignData.brandImageUrl || null
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`)
    }

    console.log(`✅ Campaign created: ${data.id}`)
    return data
  }

  /**
   * Get campaign by ID
   */
  static async findById(campaignId) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (error) {
      throw new Error(`Failed to get campaign: ${error.message}`)
    }

    return data
  }

  /**
   * Get campaigns with filters
   */
  static async findAll(filters = {}) {
    let query = supabase.from('campaigns').select('*')

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.brandAddress) {
      query = query.eq('brand_address', filters.brandAddress)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get campaigns: ${error.message}`)
    }

    return data
  }

  /**
   * Update campaign
   */
  static async update(campaignId, updates) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`)
    }

    console.log(`📝 Campaign updated: ${campaignId}`)
    return data
  }

  /**
   * Delete campaign
   */
  static async delete(campaignId) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`)
    }

    console.log(`🗑️ Campaign deleted: ${campaignId}`)
    return true
  }

  /**
   * Get open campaigns for creators to browse
   */
  static async findOpenCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get open campaigns: ${error.message}`)
    }

    return data
  }
}