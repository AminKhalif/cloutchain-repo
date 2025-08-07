import { TikTokEmbed } from './TikTokEmbed';
import { AIVerificationPanel } from './AIVerificationPanel';
import { ImpactTracker } from './ImpactTracker';
import { SecureTheBag } from './SecureTheBag';
import { useSubmissionData } from '../hooks/useSubmissionData';
import { getAIResult, checkMetricsReached, getCurrentMetrics, getTargetMetrics } from '../utils/submissionHelpers';

interface SubmissionCardProps {
  submission: {
    id: string;
    tiktok_url: string;
    ai_verification_status?: string;
    ai_overall_score?: number;
    ai_recommendation?: 'approved' | 'needs_review' | 'rejected';
    ai_explanation?: string;
    current_metrics?: {
      views?: number;
      likes?: number;
    };
    campaigns?: {
      campaign_name: string;
      target_metrics?: {
        views?: number;
        likes?: number;
      };
      reward_amount: number;
    };
  };
  onClaimPayment?: (submissionId: string) => void;
  isProcessingPayment?: boolean;
  animationDelay?: number;
}

export function SubmissionCard({ 
  submission, 
  onClaimPayment, 
  isProcessingPayment = false,
  animationDelay = 0 
}: SubmissionCardProps) {
  const { data: liveData, refresh } = useSubmissionData(submission.id);
  
  // Use live data if available, otherwise use initial submission data
  const currentSubmission = liveData || submission;
  
  // Safe refresh function
  const safeRefresh = () => {
    try {
      refresh();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  
  // Clean, modular data calculations
  const aiResult = getAIResult(currentSubmission);
  const currentMetrics = getCurrentMetrics(currentSubmission);
  const targetMetrics = getTargetMetrics(currentSubmission);
  const metricsReached = checkMetricsReached(currentMetrics, targetMetrics);

  // Debug
  console.log('SUBMISSION DATA:', { 
    aiResult: aiResult?.recommendation, 
    currentMetrics, 
    targetMetrics, 
    metricsReached 
  });

  const handleClaimPayment = () => {
    if (onClaimPayment) {
      onClaimPayment(submission.id);
    }
  };

  return (
    <div 
      className="animate-slide-in" 
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/20 border border-slate-200/50 shadow-2xl backdrop-blur-sm">
        
        {/* Ambient Glow Effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            
            {/* TikTok Video */}
            <div className="lg:col-span-2">
              <TikTokEmbed 
                url={submission.tiktok_url}
                className=""
              />
              
              {/* Campaign Badge */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/50 shadow-md">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-slate-700 text-sm">
                    {submission.campaigns?.campaign_name || 'Campaign'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Analysis & Verification Section */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* CloutVision Agent */}
              <AIVerificationPanel 
                submissionId={submission.id} 
                onAnalysisComplete={safeRefresh}
                existingResult={currentSubmission ? {
                  ai_verification_status: currentSubmission.ai_verification_status,
                  ai_overall_score: currentSubmission.ai_overall_score,
                  ai_recommendation: currentSubmission.ai_recommendation,
                  ai_explanation: currentSubmission.ai_explanation
                } : undefined}
              />
              
              {/* Impact Tracker - Metrics checking */}
              <ImpactTracker 
                submissionId={submission.id}
                currentMetrics={currentMetrics}
                targetMetrics={targetMetrics}
                onMetricsUpdate={safeRefresh}
              />
              
              {/* Secure the Bag - Payment section */}
              <SecureTheBag
                rewardAmount={submission.campaigns?.reward_amount || 0.00001}
                aiResult={aiResult}
                metricsReached={metricsReached}
                onPaymentSuccess={handleClaimPayment}
                isProcessing={isProcessingPayment}
              />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}