// Supabase client configuration for CloutChain frontend
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rkffeywpxppwlwujjqbi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZmZleXdweHBwd2x3dWpqcWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTMzNjQsImV4cCI6MjA2OTU2OTM2NH0.g_jRaj8lsl6Oo7tJecvBxrsSlj7el93t20t8zpUwlL0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript types for our database schema
export interface Campaign {
  id: string
  brand_address: string
  creator_address?: string
  tiktok_url: string
  target_metrics: {
    likes?: number
    views?: number
    comments?: number
    shares?: number
  }
  reward_amount: number
  contract_address?: string
  status: 'open' | 'accepted' | 'in_progress' | 'completed' | 'failed'
  ai_verification_status: 'pending' | 'approved' | 'rejected' | 'needs_review'
  current_metrics: {
    likes?: number
    views?: number
    comments?: number
    shares?: number
    fetchedAt?: string
  }
  created_at: string
  updated_at: string
  completed_at?: string
  campaign_description?: string
  brand_requirements?: string
  tags?: string[]
}

export interface MetricsHistory {
  id: string
  campaign_id: string
  metrics: {
    likes: number
    views: number
    comments: number
    shares: number
    fetchedAt: string
  }
  fetched_at: string
  source: string
}

export interface AIVerification {
  id: string
  campaign_id: string
  video_url: string
  analysis_result: {
    content_appropriate: boolean
    brand_compliance: number
    engagement_prediction: number
    fraud_detected: boolean
    feedback: string
  }
  confidence_score: number
  verification_status: 'approved' | 'rejected' | 'needs_review'
  ai_feedback?: string
  created_at: string
}

export interface BlockchainTransaction {
  id: string
  campaign_id: string
  transaction_hash: string
  transaction_type: 'create_campaign' | 'accept_campaign' | 'release_payment' | 'refund'
  from_address: string
  to_address?: string
  amount?: number
  gas_used?: number
  gas_price?: number
  block_number?: number
  status: 'pending' | 'confirmed' | 'failed'
  created_at: string
  confirmed_at?: string
}