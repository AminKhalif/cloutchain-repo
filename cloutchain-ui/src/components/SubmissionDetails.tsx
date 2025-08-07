import { useState } from 'react';
import { RefreshCw, Calendar, User, ExternalLink, Award, Clock } from 'lucide-react';
import { TikTokEmbed } from './TikTokEmbed';
import { MetricsCard } from './MetricsCard';
import { StatusBadge } from './StatusBadge';

interface SubmissionDetailsProps {
  submission: {
    id: string;
    campaign_id: string;
    creator_address: string;
    tiktok_url: string;
    current_metrics?: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
      author: string;
      fetchedAt: string;
    };
    status: string;
    ai_verification_status: string;
    created_at: string;
    updated_at: string;
    campaigns: {
      campaign_name: string;
      target_metrics: {
        views?: number;
        likes?: number;
        comments?: number;
        shares?: number;
      };
      reward_amount: number;
    };
  };
  onCheckMetrics: (submissionId: string) => void;
  isCheckingMetrics: boolean;
}

export function SubmissionDetails({ submission, onCheckMetrics, isCheckingMetrics }: SubmissionDetailsProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const metrics = submission.current_metrics || { views: 0, likes: 0, comments: 0, shares: 0, author: 'Unknown', fetchedAt: '' };
  const targets = submission.campaigns?.target_metrics || {};
  
  const isTargetReached = (
    (!targets.views || metrics.views >= targets.views) &&
    (!targets.likes || metrics.likes >= targets.likes) &&
    (!targets.comments || metrics.comments >= targets.comments) &&
    (!targets.shares || metrics.shares >= targets.shares)
  );

  const lastUpdated = metrics.fetchedAt ? new Date(metrics.fetchedAt).toLocaleString() : 'Never';

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{submission.campaigns?.campaign_name || 'Campaign'}</h2>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>@{metrics.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(submission.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={14} />
                <span>{submission.campaigns?.reward_amount || 0} ETH</span>
              </div>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col gap-2 items-end">
            <StatusBadge 
              status={submission.status}
              text={submission.status === 'submitted' ? 'Submitted' : submission.status === 'completed' ? 'Completed' : 'Processing'}
            />
            <StatusBadge 
              status={submission.ai_verification_status}
              text={submission.ai_verification_status === 'pending' ? 'AI Reviewing...' : submission.ai_verification_status === 'passed' ? 'AI Approved' : 'AI Review Failed'}
            />
          </div>
        </div>

        {/* Target Reached Banner */}
        {isTargetReached && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/30 rounded-full">
                <Award size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🎉 Targets Achieved!</h3>
                <p className="text-white/90 text-sm">This submission has met all campaign goals</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 space-y-8">
        {/* Video and Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TikTok Video Embed */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📱 Content
            </h3>
            <TikTokEmbed url={submission.tiktok_url} className="w-full" />
          </div>

          {/* Metrics Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📊 Performance Metrics
              </h3>
              <button
                onClick={() => onCheckMetrics(submission.id)}
                disabled={isCheckingMetrics}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={16} className={isCheckingMetrics ? 'animate-spin' : ''} />
                {isCheckingMetrics ? 'Updating...' : 'Refresh Metrics'}
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricsCard 
                current={metrics.views}
                target={targets.views || 0}
                type="views"
              />
              <MetricsCard 
                current={metrics.likes}
                target={targets.likes || 0}
                type="likes"
              />
              <MetricsCard 
                current={metrics.comments}
                target={targets.comments || 0}
                type="comments"
              />
              <MetricsCard 
                current={metrics.shares}
                target={targets.shares || 0}
                type="shares"
              />
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Clock size={14} />
              <span>Last updated: {lastUpdated}</span>
              {isCheckingMetrics && (
                <div className="ml-auto flex items-center gap-1 text-blue-600">
                  <RefreshCw size={12} className="animate-spin" />
                  <span className="text-xs">⚠️ Using TikTok API credits</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🔗 Links & Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Creator Address:</span>
              <p className="font-mono text-xs bg-white rounded px-2 py-1 mt-1 border">
                {submission.creator_address.slice(0, 10)}...{submission.creator_address.slice(-8)}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Submission ID:</span>
              <p className="font-mono text-xs bg-white rounded px-2 py-1 mt-1 border">
                {submission.id.slice(0, 8)}...
              </p>
            </div>
            <div>
              <span className="text-gray-600">Original Video:</span>
              <a 
                href={submission.tiktok_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors mt-1"
              >
                <ExternalLink size={12} />
                <span className="text-xs">View on TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}