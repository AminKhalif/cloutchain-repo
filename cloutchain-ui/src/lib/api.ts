// API client for CloutChain backend
import axios from 'axios'
import type { Campaign } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response wrapper type
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  count?: number
}

// API functions
export const apiClient = {
  // Health check
  async health(): Promise<{ status: string; database: string; timestamp: string; version: string }> {
    const response = await api.get('/health')
    return response.data
  },

  // Campaign endpoints
  campaigns: {
    // Get all campaigns
    async getAll(filters?: {
      status?: string
      brand_address?: string
      creator_address?: string
    }): Promise<Campaign[]> {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.brand_address) params.append('brand_address', filters.brand_address)
      if (filters?.creator_address) params.append('creator_address', filters.creator_address)
      
      const response = await api.get<ApiResponse<Campaign[]>>(`/api/campaigns?${params}`)
      return response.data.data
    },

    // Get single campaign
    async getById(id: string): Promise<Campaign & {
      metrics_history: any[]
      ai_verifications: any[]
      transactions: any[]
    }> {
      const response = await api.get<ApiResponse<Campaign & {
        metrics_history: any[]
        ai_verifications: any[]
        transactions: any[]
      }>>(`/api/campaigns/${id}`)
      return response.data.data
    },

    // Create new campaign
    async create(campaignData: {
      brand_address: string
      campaign_name: string
      target_metrics: Record<string, number>
      reward_amount: number
      description?: string
      requirements?: string
      tags?: string[]
    }): Promise<Campaign> {
      const response = await api.post<ApiResponse<Campaign>>('/api/campaigns', campaignData)
      return response.data.data
    },

    // Accept campaign
    async accept(id: string, creator_address: string): Promise<Campaign> {
      const response = await api.post<ApiResponse<Campaign>>(`/api/campaigns/${id}/accept`, {
        creator_address
      })
      return response.data.data
    },

    // Fetch TikTok metrics
    async fetchMetrics(id: string): Promise<{
      metrics: any
      target_reached: boolean
      campaign_status: string
    }> {
      const response = await api.post<ApiResponse<{
        metrics: any
        target_reached: boolean
        campaign_status: string
      }>>(`/api/campaigns/${id}/fetch-metrics`)
      return response.data.data
    },

    // Submit for AI verification
    async verify(id: string, video_url: string): Promise<{
      verification_status: string
      analysis: any
    }> {
      const response = await api.post<ApiResponse<{
        verification_status: string
        analysis: any
      }>>(`/api/campaigns/${id}/verify`, { video_url })
      return response.data.data
    },

    // Get metrics history
    async getMetrics(id: string): Promise<any[]> {
      const response = await api.get<ApiResponse<any[]>>(`/api/campaigns/${id}/metrics`)
      return response.data.data
    },

    // Get open campaigns for creators
    async getOpen(): Promise<Campaign[]> {
      const response = await api.get<ApiResponse<Campaign[]>>('/api/campaigns/open')
      return response.data.data
    },

    // Create campaign with image
    async createWithImage(formData: FormData): Promise<Campaign> {
      const response = await api.post<ApiResponse<Campaign>>('/api/campaigns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data
    },

    // Update funding transaction hash and blockchain campaign ID
    async updateFunding(id: string, txHash: string, blockchainCampaignId?: number): Promise<Campaign> {
      const payload: any = { funding_tx_hash: txHash }
      if (blockchainCampaignId !== undefined) {
        payload.blockchain_campaign_id = blockchainCampaignId
      }
      const response = await api.patch<ApiResponse<Campaign>>(`/api/campaigns/${id}/funding`, payload)
      return response.data.data
    },

    // Delete campaign
    async delete(id: string): Promise<void> {
      await api.delete(`/api/campaigns/${id}`)
    }
  },

  // Submission endpoints
  submissions: {
    // Create new submission
    async create(submissionData: {
      campaign_id: string
      creator_address: string
      tiktok_url: string
    }): Promise<any> {
      const response = await api.post<ApiResponse<any>>('/api/submissions', submissionData)
      return response.data.data
    },

    // Get submissions by creator
    async getByCreator(creator_address: string): Promise<any[]> {
      const response = await api.get<ApiResponse<any[]>>(`/api/submissions/creator?creator_address=${creator_address}`)
      return response.data.data
    },

    // Get submissions for a campaign
    async getByCampaign(campaignId: string): Promise<any[]> {
      const response = await api.get<ApiResponse<any[]>>(`/api/submissions/campaign/${campaignId}`)
      return response.data.data
    },

    // Get submission by ID
    async getById(id: string): Promise<any> {
      const response = await api.get<ApiResponse<any>>(`/api/submissions/${id}`)
      return response.data.data
    },

    // Update metrics for submission
    async updateMetrics(id: string): Promise<any> {
      const response = await api.post<ApiResponse<any>>(`/api/submissions/${id}/update-metrics`)
      return response.data.data
    },

    // Process payment for submission (no API calls, uses existing data)
    async processPayment(id: string): Promise<{ transactionHash: string; amount: number }> {
      const response = await api.post<ApiResponse<{ transactionHash: string; amount: number }>>(`/api/submissions/${id}/process-payment`)
      return response.data.data
    },

    // Delete submission
    async delete(id: string): Promise<void> {
      await api.delete(`/api/submissions/${id}`)
    },

    // Run AI verification on submission
    async runAIVerification(id: string): Promise<any> {
      const response = await api.post<ApiResponse<any>>(`/api/submissions/${id}/verify`)
      return response.data.data
    }
  },

  // Payment endpoints  
  payments: {
    // Get payment history for creator
    async getHistory(creatorAddress: string): Promise<{ payments: any[]; totalEarnings: number; count: number }> {
      const response = await api.get<ApiResponse<{ payments: any[]; totalEarnings: number; count: number }>>(`/api/payments/history?creator_address=${creatorAddress}`)
      return response.data.data
    }
  },

  // Blockchain endpoints
  blockchain: {
    // Test connection
    async testConnection(): Promise<{
      success: boolean
      contractOwner?: string
      totalCampaigns?: string
      walletBalance?: string
      error?: string
    }> {
      const response = await api.get('/api/blockchain/connection')
      return response.data
    },

    // Create campaign on blockchain
    async createCampaign(campaignData: {
      name: string
      payoutPerCreator: string
      viewsThreshold?: number
      likesThreshold?: number
      useLikesForDemo?: boolean
      totalFunding: string
    }): Promise<{
      success: boolean
      campaignId?: number
      transactionHash?: string
      error?: string
    }> {
      const response = await api.post('/api/blockchain/create-campaign', campaignData)
      return response.data
    },

    // Check metrics and trigger payment
    async checkMetrics(submissionData: {
      tiktokUrl: string
      campaignId: number
      creatorAddress: string
      requireAiApproval?: boolean
      videoPath?: string
    }): Promise<{
      success: boolean
      metricsReached?: boolean
      aiApproved?: boolean
      shouldPay?: boolean
      currentMetrics?: any
      targetMetrics?: any
      paymentResult?: any
      error?: string
    }> {
      const response = await api.post('/api/blockchain/check-metrics', submissionData)
      return response.data
    },

    // Quick test with Blai video
    async testBlai(): Promise<{
      success: boolean
      metricsReached?: boolean
      currentMetrics?: any
      targetMetrics?: any
      paymentResult?: any
      error?: string
    }> {
      const response = await api.post('/api/blockchain/test-blai')
      return response.data
    }
  },

  // Legacy transaction endpoint (kept for compatibility)
  transactions: {
    // Store transaction
    async store(transactionData: {
      campaign_id: string
      transaction_hash: string
      transaction_type: string
      from_address: string
      to_address?: string
      amount?: number
    }): Promise<any> {
      const response = await api.post<ApiResponse<any>>('/api/transactions', transactionData)
      return response.data.data
    }
  }
}

// Export default
export default apiClient