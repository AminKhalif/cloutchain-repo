// Campaign Controller - Handles brand campaign operations
import { Campaign } from '../models/Campaign.js'
import { uploadToSupabase, deleteFromSupabase } from '../services/fileUpload.js'

export class CampaignController {
  /**
   * Create a new campaign (Brand creates requirements)
   */
  static async create(req, res) {
    try {
      console.log('📋 Campaign creation request:', req.body)
      
      let {
        brand_address,
        campaign_name,
        target_metrics,
        reward_amount,
        description,
        requirements,
        tags
      } = req.body

      // Parse JSON strings from FormData 
      if (typeof target_metrics === 'string') {
        target_metrics = JSON.parse(target_metrics)
      }
      if (typeof tags === 'string') {
        tags = JSON.parse(tags)
      }

      // Validate required fields for brand campaigns
      if (!brand_address || !campaign_name || !target_metrics || !reward_amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: brand_address, campaign_name, target_metrics, reward_amount'
        })
      }

      // Validate target metrics format
      if (typeof target_metrics !== 'object' || Object.keys(target_metrics).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'target_metrics must be an object with at least one metric'
        })
      }

      // Validate reward amount
      if (reward_amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'reward_amount must be greater than 0'
        })
      }

      // Handle image upload if present
      let brandImageUrl = null
      if (req.file) {
        try {
          const uploadResult = await uploadToSupabase(req.file)
          brandImageUrl = uploadResult.publicUrl
        } catch (uploadError) {
          return res.status(400).json({
            success: false,
            error: `Image upload failed: ${uploadError.message}`
          })
        }
      }

      // Create campaign
      const campaign = await Campaign.create({
        brandAddress: brand_address,
        campaignName: campaign_name,
        targetMetrics: target_metrics,
        rewardAmount: reward_amount,
        description: description || '',
        requirements: requirements || '',
        tags: tags || [],
        brandImageUrl: brandImageUrl
      })

      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully'
      })

    } catch (error) {
      console.error('Error creating campaign:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Get all campaigns with optional filters
   */
  static async getAll(req, res) {
    try {
      const { status, brand_address } = req.query
      const filters = {}
      
      if (status) filters.status = status
      if (brand_address) filters.brandAddress = brand_address

      const campaigns = await Campaign.findAll(filters)
      
      res.json({
        success: true,
        data: campaigns,
        count: campaigns.length
      })
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Get single campaign by ID
   */
  static async getById(req, res) {
    try {
      const campaign = await Campaign.findById(req.params.id)
      
      res.json({
        success: true,
        data: campaign
      })
    } catch (error) {
      console.error('Error fetching campaign:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Get open campaigns for creators to browse
   */
  static async getOpenCampaigns(req, res) {
    try {
      const campaigns = await Campaign.findOpenCampaigns()
      
      res.json({
        success: true,
        data: campaigns,
        count: campaigns.length
      })
    } catch (error) {
      console.error('Error fetching open campaigns:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Update campaign status
   */
  static async updateStatus(req, res) {
    try {
      const { status } = req.body
      
      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        })
      }

      const campaign = await Campaign.update(req.params.id, { status })
      
      res.json({
        success: true,
        data: campaign,
        message: 'Campaign status updated successfully'
      })
    } catch (error) {
      console.error('Error updating campaign:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Update campaign funding transaction hash
   */
  static async updateFunding(req, res) {
    try {
      const { funding_tx_hash, blockchain_campaign_id } = req.body
      
      if (!funding_tx_hash) {
        return res.status(400).json({
          success: false,
          error: 'funding_tx_hash is required'
        })
      }

      const updateData = { 
        funding_tx_hash,
        funded_amount: null // Could add amount if needed
      }
      
      // Also save blockchain campaign ID if provided
      if (blockchain_campaign_id !== undefined) {
        updateData.blockchain_campaign_id = blockchain_campaign_id
      }

      const campaign = await Campaign.update(req.params.id, updateData)
      
      res.json({
        success: true,
        data: campaign,
        message: 'Campaign funding updated successfully'
      })
    } catch (error) {
      console.error('Error updating campaign funding:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * Delete campaign by ID
   */
  static async delete(req, res) {
    try {
      const campaignId = req.params.id
      
      // Delete the campaign (this will also delete related submissions via cascade)
      await Campaign.delete(campaignId)
      
      console.log(`🗑️ Campaign deleted: ${campaignId}`)
      
      res.json({
        success: true,
        message: 'Campaign deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting campaign:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}