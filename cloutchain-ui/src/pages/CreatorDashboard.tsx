import { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, Video, Star, Target } from 'lucide-react';
import { WalletConnect } from '@/components/WalletConnect';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { SubmissionDetails } from '@/components/SubmissionDetails';
import { BlockchainMetricsChecker } from '@/components/BlockchainMetricsChecker';
import { SubmissionCard } from '@/components/SubmissionCard';
import { EmptySubmissionsState } from '@/components/EmptySubmissionsState';
import { ActiveCampaignCard } from '@/components/dashboard/ActiveCampaignCard';
import { PaymentStatusCard } from '@/components/dashboard/PaymentStatusCard';
import { CloutVisionCard } from '@/components/dashboard/CloutVisionCard';
import { CampaignProgressCard } from '@/components/dashboard/CampaignProgressCard';
import { EnhancedAvailableBalanceCard } from '@/components/dashboard/EnhancedAvailableBalanceCard';
import { CloutVisionAgent } from '@/components/CloutVisionAgent';
import { useMetricsFetching } from '@/hooks/useMetricsFetching';
import { usePayoutFlow } from '@/hooks/usePayoutFlow';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Submission {
  id: string;
  campaign_id: string;
  creator_address: string;
  tiktok_url: string;
  current_metrics: any;
  status: string;
  ai_verification_status: string;
  ai_recommendation?: 'approved' | 'needs_review' | 'rejected';
  ai_overall_score?: number;
  campaigns: {
    campaign_name: string;
    target_metrics: any;
    reward_amount: number;
  };
}

export default function CreatorDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    submissionId: string;
    campaignName: string;
  }>({ isOpen: false, submissionId: '', campaignName: '' });
  const [formData, setFormData] = useState({
    campaignId: '',
    videoUrl: ''
  });
  const [applicationModal, setApplicationModal] = useState<{
    isOpen: boolean;
    campaign: any | null;
    videoUrl: string;
  }>({ isOpen: false, campaign: null, videoUrl: '' });
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [aiVerified, setAiVerified] = useState<boolean>(false);
  const [engagementReached, setEngagementReached] = useState<boolean>(false);
  const [isRunningAI, setIsRunningAI] = useState<boolean>(false);
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState<boolean>(false);
  
  // AI Analysis State - persists across tab switches
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [showAiDetails, setShowAiDetails] = useState<boolean>(false);
  
  // Metrics fetching hook - isolated from AI logic
  const { isFetching: isFetchingMetrics, fetchMetrics } = useMetricsFetching();
  
  // Payout processing hook - isolated from other logic
  const { isProcessing: isProcessingPayout, processPayment } = usePayoutFlow();

  // Load data when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadData();
    }
  }, [walletAddress]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load open campaigns, user submissions, and payment history
      const [openCampaigns, userSubmissions, paymentData] = await Promise.all([
        apiClient.campaigns.getOpen(),
        apiClient.submissions.getByCreator(walletAddress!),
        apiClient.payments.getHistory(walletAddress!)
      ]);
      setCampaigns(openCampaigns);
      setSubmissions(userSubmissions);
      setPaymentHistory(paymentData.payments);
      setTotalEarnings(paymentData.totalEarnings);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.campaignId || !formData.videoUrl) {
      toast.error('Please select a campaign and enter TikTok URL');
      return;
    }

    setIsSubmitting(true);

    try {
      const submission = await apiClient.submissions.create({
        campaign_id: formData.campaignId,
        creator_address: walletAddress,
        tiktok_url: formData.videoUrl
      });

      // Add to local state
      setSubmissions(prev => [submission, ...prev]);
      setFormData({ campaignId: '', videoUrl: '' });
      
      toast.success('Video submitted successfully!');
      
    } catch (error: any) {
      console.error('Error submitting video:', error);
      toast.error(`Failed to submit video: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckPayment = async (submissionId: string) => {
    setIsChecking(submissionId);

    try {
      // Use payment-only endpoint (no TikTok API calls)
      const result = await apiClient.submissions.processPayment(submissionId);
      
      toast.success('💰 Payment processed successfully!', {
        duration: 5000,
      });
      
      // Refresh payment history
      const paymentData = await apiClient.payments.getHistory(walletAddress!);
      setPaymentHistory(paymentData.payments);
      setTotalEarnings(paymentData.totalEarnings);
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setIsChecking(null);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    setIsDeleting(submissionId);

    try {
      await apiClient.submissions.delete(submissionId);
      
      // Remove from local state
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      
      toast.success('Submission deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast.error(`Failed to delete submission: ${error.message}`);
    } finally {
      setIsDeleting(null);
      setConfirmModal({ isOpen: false, submissionId: '', campaignName: '' });
    }
  };

  const openDeleteModal = (submissionId: string, campaignName: string) => {
    setConfirmModal({ isOpen: true, submissionId, campaignName });
  };

  const closeDeleteModal = () => {
    setConfirmModal({ isOpen: false, submissionId: '', campaignName: '' });
  };

  const openApplicationModal = (campaign: any) => {
    setApplicationModal({ isOpen: true, campaign, videoUrl: '' });
  };

  const closeApplicationModal = () => {
    setApplicationModal({ isOpen: false, campaign: null, videoUrl: '' });
  };

  const handleWithdraw = async () => {
    if (aiVerified && engagementReached) {
      await handleSecureTheBag();
    } else {
      toast.error('Complete all requirements first');
    }
  };

  // ISOLATED AI HANDLER - Only touches AI state
  const handleAIAnalysisComplete = (result: any) => {
    // Update the persistent AI analysis result
    setAiAnalysisResult(result);
    
    // Update AI verification status based on analysis result
    if (result && result.ai_recommendation === 'approved') {
      setAiVerified(true);
    } else {
      setAiVerified(false);
    }
  };

  // ISOLATED ENGAGEMENT HANDLER - Only touches engagement state  
  const handleEngagementUpdate = (metrics: { views: number; likes: number; targetReached: boolean }) => {
    // Update engagement reached status
    setEngagementReached(metrics.targetReached);
    
    // Update submissions with new metrics
    if (submissions.length > 0) {
      setSubmissions(prev => prev.map(sub => {
        if (sub.id === submissions[0].id) {
          return {
            ...sub,
            current_metrics: {
              views: metrics.views,
              likes: metrics.likes
            }
          };
        }
        return sub;
      }));
    }
  };

  // ISOLATED METRICS FETCHING HANDLER
  const handleFetchMetrics = async () => {
    if (!submissions.length) return;
    
    const result = await fetchMetrics(submissions[0].id);
    if (result) {
      handleEngagementUpdate(result);
    }
  };

  // ISOLATED PAYOUT HANDLER - Only handles payment processing
  const handleSecureTheBag = async () => {
    if (!submissions.length) return;
    
    const result = await processPayment(submissions[0].id);
    if (result.success) {
      // Refresh payment history after successful payout
      const paymentData = await apiClient.payments.getHistory(walletAddress!);
      setPaymentHistory(paymentData.payments);
      setTotalEarnings(paymentData.totalEarnings);
    }
  };

  const handleSubmitApplication = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!applicationModal.videoUrl) {
      toast.error('Please enter a TikTok URL');
      return;
    }

    setIsSubmitting(true);

    try {
      const submission = await apiClient.submissions.create({
        campaign_id: applicationModal.campaign.id,
        creator_address: walletAddress,
        tiktok_url: applicationModal.videoUrl
      });

      // Add to local state
      setSubmissions(prev => [submission, ...prev]);
      
      toast.success('Video submitted successfully!');
      closeApplicationModal();
      
      // Switch to campaigns tab to show the submission
      setActiveTab('campaigns');
      
    } catch (error: any) {
      console.error('Error submitting video:', error);
      toast.error(`Failed to submit video: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate metrics from submissions
  const calculateMetrics = () => {
    const totalViews = submissions.reduce((sum, sub) => sum + (sub.current_metrics?.views || 0), 0);
    const totalLikes = submissions.reduce((sum, sub) => sum + (sub.current_metrics?.likes || 0), 0);
    
    // Calculate rank based on view count (higher views = better rank)
    // Hardcoded rank for demo purposes
    return {
      totalViews,
      totalLikes,
      rank: 1
    };
  };

  const metrics = calculateMetrics();

  const tabs = [
    { id: 'campaigns', label: 'Campaigns' }, 
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'payments', label: 'Payments' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingOverlay 
        message={isSubmitting ? "Submitting video and starting AI analysis..." : "Checking views and processing payment..."}
        isVisible={isSubmitting || isChecking !== null}
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
            </div>
            <WalletConnect 
              onConnect={(address) => setWalletAddress(address)}
              onDisconnect={() => setWalletAddress(null)}
            />
          </div>

          {/* Stats Cards */}
          {walletAddress && (
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lifetime Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">{totalEarnings.toFixed(6)} ETH</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lifetime Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lifetime Views</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Creator Rank</p>
                    <p className="text-2xl font-bold text-gray-900">#{metrics.rank}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          {walletAddress && (
            <div className="flex space-x-8 border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">

        {/* Wallet Connection Required */}
        {!walletAddress && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">
              Please connect your MetaMask wallet to submit videos and track earnings.
            </p>
          </div>
        )}

        {/* Tab Content */}
        {walletAddress && (
          <>
            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="space-y-8">
                {/* Top Cards - Available Balance + Campaign Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Expected Earnings Card */}
                  <EnhancedAvailableBalanceCard 
                    expectedEthAmount={submissions.length > 0 ? submissions[0].campaigns?.reward_amount || 0 : 0}
                    canWithdraw={aiVerified && engagementReached}
                    onWithdraw={handleWithdraw}
                    isProcessing={isProcessingPayout}
                  />
                  
                  {/* Campaign Progress Card */}
                  <CampaignProgressCard 
                    aiVerified={aiVerified}
                    engagementReached={engagementReached}
                    activeCampaigns={submissions.length}
                    totalViews={metrics.totalViews}
                  />
                </div>

                {/* Active Campaigns Section */}
                {submissions.length > 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Active Campaigns</h2>
                      <p className="text-gray-600">Track your progress and earnings</p>
                    </div>
                    <ActiveCampaignCard 
                      submission={submissions[0]} 
                      isUpdating={isFetchingMetrics}
                    />
                  </div>
                )}

                {/* Bottom Action Cards - CloutVision Agent & Fetch Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
                  {/* CloutVision Agent */}
                  <CloutVisionAgent 
                    submissionId={submissions.length > 0 ? submissions[0].id : undefined}
                    onAnalysisComplete={handleAIAnalysisComplete}
                    disabled={submissions.length === 0}
                    analysisResult={aiAnalysisResult}
                    showDetails={showAiDetails}
                    onShowDetailsChange={setShowAiDetails}
                  />

                  {/* Fetch Analytics */}
                  <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 h-fit">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Fetch Analytics</h3>
                        <p className="text-gray-600 text-sm mb-4">Update your campaign performance metrics</p>
                        <button 
                          onClick={handleFetchMetrics}
                          disabled={submissions.length === 0 || isFetchingMetrics}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
                        >
                          {isFetchingMetrics ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Fetching Metrics...
                            </div>
                          ) : (
                            'Check Latest Metrics'
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Show empty state only if no submissions */}
                {submissions.length === 0 && <EmptySubmissionsState />}
              </div>
            )}

            {/* Marketplace Tab */}
            {activeTab === 'marketplace' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Campaign Marketplace</h2>
                    <p className="text-gray-600 mt-1">Discover opportunities and grow your creator economy</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-blue-600">🤖</span>
                    <span className="text-sm font-medium text-blue-700">AI Recommendations</span>
                  </div>
                </div>

                {/* Campaign Cards - Full Width */}
                <div className="space-y-8">
                  {campaigns.map((campaign, index) => (
                    <div key={campaign.id} 
                         className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                         style={{ animationDelay: `${index * 100}ms` }}>
                      
                      <div className="p-8">
                        {/* Header Section */}
                        <div className="flex items-start gap-6 mb-8">
                          {/* Brand Image */}
                          <div className="flex-shrink-0">
                            {campaign.brand_image_url ? (
                              <img 
                                src={campaign.brand_image_url} 
                                alt={campaign.campaign_name}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl font-bold">
                                  {campaign.brand_address?.slice(2, 4).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Campaign Title & Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-2xl font-bold text-gray-900">{campaign.campaign_name}</h3>
                              <div className="flex gap-2">
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                  ✨ {campaign.status}
                                </span>
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                  {campaign.reward_amount >= 0.001 ? '💎 Premium' : '🚀 Standard'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Brand Info */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-gray-600 text-sm">Brand Partner:</span>
                              <span className="font-mono text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                {campaign.brand_address?.slice(0, 6)}...{campaign.brand_address?.slice(-4)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Reward Box */}
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-6 text-center min-w-[140px]">
                              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Reward</p>
                              <p className="text-3xl font-bold text-gray-900">{campaign.reward_amount}</p>
                              <p className="text-sm font-medium text-green-600 mb-1">ETH</p>
                              <p className="text-xs text-gray-500">
                                ≈ ${(campaign.reward_amount * 3400).toFixed(2)} USD
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Campaign Description (BOLD) */}
                        {campaign.campaign_description && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Campaign Description</h4>
                            <p className="text-gray-900 font-bold text-base leading-relaxed">
                              {campaign.campaign_description}
                            </p>
                          </div>
                        )}

                        {/* Divider Line */}
                        <div className="border-t-2 border-gray-200 my-6"></div>

                        {/* Content Requirements */}
                        {campaign.brand_requirements && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                              📋 Content Requirements
                            </h4>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                              <p className="text-gray-800 font-medium text-base leading-relaxed">
                                {campaign.brand_requirements}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Bottom Section Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          {/* Target Metrics */}
                          <div className="bg-gray-50 rounded-xl p-5">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                              🎯 Target Goals
                            </h4>
                            <div className="space-y-3">
                              {campaign.target_metrics?.likes && (
                                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <span className="text-red-600 text-xl">❤️</span>
                                  </div>
                                  <div>
                                    <p className="text-xl font-bold text-gray-900">
                                      {campaign.target_metrics.likes.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Likes Required</p>
                                  </div>
                                </div>
                              )}
                              {campaign.target_metrics?.views && (
                                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 text-xl">👁️</span>
                                  </div>
                                  <div>
                                    <p className="text-xl font-bold text-gray-900">
                                      {campaign.target_metrics.views.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Views Required</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Campaign Status */}
                          <div className="bg-blue-50 rounded-xl p-5">
                            <h4 className="text-sm font-semibold text-blue-700 mb-4 flex items-center gap-2">
                              ✅ Campaign Status
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">💰 Funds Status:</span>
                                <span className="font-bold text-green-600">Secured on Blockchain</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">📅 Created:</span>
                                <span className="font-bold text-gray-700">
                                  {new Date(campaign.created_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">⚡ Payment:</span>
                                <span className="font-bold text-blue-600">Instant & Automatic</span>
                              </div>
                              {campaign.funding_tx_hash && (
                                <div className="pt-3 border-t border-blue-200">
                                  <a 
                                    href={`https://sepolia.etherscan.io/tx/${campaign.funding_tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                                  >
                                    🔗 View Blockchain Receipt
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <div className="flex justify-center">
                          <button 
                            onClick={() => openApplicationModal(campaign)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 text-lg"
                          >
                            <span>Apply Now</span>
                            <span className="text-xl">🚀</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {campaigns.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-200">
                      <div className="text-gray-400 mb-6">
                        <Target size={64} className="mx-auto mb-4" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-2">No campaigns available</h3>
                      <p className="text-gray-500 text-lg">Check back later for new opportunities!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                  <button className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1">
                    💰 Withdraw Funds
                  </button>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Available Balance</h3>
                    <p className="text-3xl font-bold text-gray-900">{totalEarnings} ETH</p>
                    <p className="text-sm text-gray-500">≈ ${(totalEarnings * 4000).toFixed(2)} USD</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Payments</h3>
                    <p className="text-3xl font-bold text-gray-900">{submissions.filter(s => s.status === 'completed' && !paymentHistory.find(p => p.id === s.id)).length > 0 ? 'Processing...' : '0 ETH'}</p>
                    <p className="text-sm text-gray-500">{submissions.filter(s => s.status === 'submitted').length} campaigns in progress</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Earned</h3>
                    <p className="text-3xl font-bold text-gray-900">{totalEarnings} ETH</p>
                    <p className="text-sm text-gray-500">Lifetime earnings</p>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  </div>
                  <div className="p-6">
                    {paymentHistory.length > 0 ? (
                      <div className="space-y-4">
                        {paymentHistory.map((payment, index) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">💰</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{payment.campaigns?.campaign_name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-600">Payment</p>
                                  <a 
                                    href={`https://sepolia.etherscan.io/tx/${payment.payment_tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    View on Etherscan 🔗
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">+{payment.payment_amount} ETH</p>
                              <p className="text-sm text-gray-500">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">💳</div>
                        <p className="text-gray-500">No payments yet</p>
                        <p className="text-xs text-gray-400 mt-1">Complete campaigns to earn payments</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
      
      {/* Application Modal */}
      <Dialog open={applicationModal.isOpen} onOpenChange={closeApplicationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Video className="w-5 h-5 text-blue-600" />
              Apply to Campaign
            </DialogTitle>
            <DialogDescription>
              Submit your TikTok video for "{applicationModal.campaign?.campaign_name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Campaign Details */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">{applicationModal.campaign?.campaign_name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Reward: {applicationModal.campaign?.reward_amount} ETH</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>Target: {applicationModal.campaign?.target_metrics?.likes || 'N/A'} likes</span>
                </div>
              </div>
            </div>
            
            {/* Video URL Input */}
            <div className="space-y-2">
              <label htmlFor="videoUrl" className="text-sm font-medium text-gray-700">
                TikTok Video URL
              </label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://www.tiktok.com/@username/video/1234567890"
                value={applicationModal.videoUrl}
                onChange={(e) => setApplicationModal(prev => ({ ...prev, videoUrl: e.target.value }))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Paste the URL of your TikTok video that meets the campaign requirements
              </p>
            </div>
            
            {/* Requirements */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-2">📋 Requirements:</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Video must be public and accessible</li>
                <li>• Must meet campaign target metrics</li>
                <li>• Payment is automatic once verified</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeApplicationModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApplication}
              disabled={isSubmitting || !applicationModal.videoUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteSubmission(confirmModal.submissionId)}
        title="Delete Submission"
        message={`Are you sure you want to delete your submission for "${confirmModal.campaignName}"? This action cannot be undone.`}
        confirmText="Delete Submission"
        type="danger"
        isLoading={isDeleting === confirmModal.submissionId}
      />
    </div>
  );
}