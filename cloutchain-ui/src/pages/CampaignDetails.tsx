import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Campaign } from '@/lib/supabase';

interface RealSubmission {
  id: string;
  campaign_id: string;
  creator_address: string;
  tiktok_url: string;
  status: string;
  ai_verification_status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_overall_score?: number;
  ai_recommendation?: 'approved' | 'needs_review' | 'rejected';
  ai_explanation?: string;
  current_metrics?: any;
  created_at: string;
  updated_at: string;
  campaigns?: {
    campaign_name: string;
    target_metrics: any;
    reward_amount: number;
  };
}

export default function CampaignDetails() {
  const { campaignId } = useParams();
  const [submissions, setSubmissions] = useState<RealSubmission[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  // Load campaign and submissions data
  useEffect(() => {
    if (campaignId) {
      loadCampaignData();
    }
  }, [campaignId]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      
      // Load campaign details and submissions in parallel
      const [campaignData, submissionsData] = await Promise.all([
        apiClient.campaigns.getById(campaignId!),
        apiClient.submissions.getByCampaign(campaignId!)
      ]);
      
      setCampaign(campaignData);
      setSubmissions(submissionsData);
      
    } catch (error: any) {
      console.error('Error loading campaign data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load campaign details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReleasePayment = async (submissionId: string) => {
    setIsProcessing(submissionId);

    try {
      // Trigger metrics check and payment on blockchain
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      const result = await apiClient.blockchain.checkMetrics({
        tiktokUrl: submission.tiktok_url,
        campaignId: campaign?.blockchain_campaign_id || 1,
        creatorAddress: submission.creator_address,
        requireAiApproval: true
      });

      if (result.success && result.shouldPay) {
        toast({
          title: "Payment Released!",
          description: "Payment has been successfully released to the creator.",
        });
        
        // Reload submissions to get updated payment status
        await loadCampaignData();
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment could not be processed.",
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      console.error('Error releasing payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to release payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const eligibleSubmissions = submissions.filter(sub => {
    const hasTargetMetrics = sub.current_metrics && campaign?.target_metrics;
    const metricsReached = hasTargetMetrics && (
      (campaign.target_metrics.views && sub.current_metrics.views >= campaign.target_metrics.views) ||
      (campaign.target_metrics.likes && sub.current_metrics.likes >= campaign.target_metrics.likes)
    );
    
    return sub.ai_recommendation === 'approved' && 
           metricsReached && 
           sub.status !== 'completed';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingOverlay 
          message="Loading campaign data..."
          isVisible={true}
        />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Campaign not found.</p>
            <Link 
              to="/brand" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary-glow transition-colors mt-4"
            >
              <ArrowLeft size={18} />
              Back to Brand Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LoadingOverlay 
        message="Processing payment release on blockchain..."
        isVisible={isProcessing !== null}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Link 
            to="/brand" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-glow transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to Brand Dashboard
          </Link>
          
          <h1 className="page-header">Campaign: {campaign.campaign_name}</h1>
          <p className="text-muted-foreground">Manage submissions and release payments</p>
        </div>

        {/* Campaign Summary */}
        <div className="campaign-card mb-8 animate-fade-in">
          <h2 className="section-title">Campaign Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <span className="text-muted-foreground">Total Submissions:</span>
              <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">AI Approved:</span>
              <p className="text-2xl font-bold text-success">{submissions.filter(s => s.ai_recommendation === 'approved').length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Needs Review:</span>
              <p className="text-2xl font-bold text-warning">{submissions.filter(s => s.ai_recommendation === 'needs_review').length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <p className="text-2xl font-bold text-primary">{submissions.filter(s => s.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="animate-fade-in">
          <h2 className="section-title">Campaign Submissions</h2>
          
          <div className="space-y-4">
            {submissions.map((submission, index) => {
              const targetMetrics = campaign?.target_metrics || {};
              const currentMetrics = submission.current_metrics || {};
              const hasTargetViews = targetMetrics.views;
              const hasTargetLikes = targetMetrics.likes;
              
              return (
                <div key={submission.id} className="submission-row animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <span className="text-muted-foreground text-sm">Creator:</span>
                          <p className="font-mono text-sm">{submission.creator_address.slice(0, 6)}...{submission.creator_address.slice(-4)}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground text-sm">TikTok Video:</span>
                          <a 
                            href={submission.tiktok_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-primary hover:text-primary-glow transition-colors text-sm truncate"
                          >
                            View Video
                          </a>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground text-sm">AI Verification:</span>
                          <div className="mt-1">
                            <StatusBadge 
                              status={submission.ai_verification_status === 'completed' ? 
                                (submission.ai_recommendation === 'approved' ? 'passed' : 'failed') : 
                                'pending'
                              }
                              text={
                                submission.ai_verification_status === 'pending' ? 'Pending' :
                                submission.ai_verification_status === 'processing' ? 'Processing...' :
                                submission.ai_recommendation === 'approved' ? `Approved (${submission.ai_overall_score}/100)` :
                                submission.ai_recommendation === 'needs_review' ? 'Needs Review' :
                                'Rejected'
                              }
                            />
                          </div>
                          {submission.ai_explanation && (
                            <p className="text-xs text-muted-foreground mt-1 truncate" title={submission.ai_explanation}>
                              {submission.ai_explanation}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground text-sm">Metrics:</span>
                          {hasTargetViews && (
                            <p className="font-medium text-sm">
                              Views: {currentMetrics.views?.toLocaleString() || '0'} / {targetMetrics.views.toLocaleString()}
                              {currentMetrics.views >= targetMetrics.views && (
                                <span className="text-success ml-1">✓</span>
                              )}
                            </p>
                          )}
                          {hasTargetLikes && (
                            <p className="font-medium text-sm">
                              Likes: {currentMetrics.likes?.toLocaleString() || '0'} / {targetMetrics.likes.toLocaleString()}
                              {currentMetrics.likes >= targetMetrics.likes && (
                                <span className="text-success ml-1">✓</span>
                              )}
                            </p>
                          )}
                          {!hasTargetViews && !hasTargetLikes && (
                            <p className="text-sm text-muted-foreground">No metrics set</p>
                          )}
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground text-sm">Status:</span>
                          <div className="mt-1">
                            <StatusBadge 
                              status={submission.status === 'completed' ? 'paid' : 'pending'}
                              text={
                                submission.status === 'completed' ? 'Completed' :
                                submission.status === 'ai_approved' ? 'AI Approved' :
                                submission.status === 'ai_rejected' ? 'AI Rejected' :
                                submission.status === 'needs_review' ? 'Needs Review' :
                                'Submitted'
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {eligibleSubmissions.some(eligible => eligible.id === submission.id) && (
                      <div className="ml-6">
                        <button
                          onClick={() => handleReleasePayment(submission.id)}
                          disabled={isProcessing === submission.id}
                          className="action-button"
                        >
                          <DollarSign size={18} />
                          Release Payment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {submissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No submissions yet for this campaign.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}