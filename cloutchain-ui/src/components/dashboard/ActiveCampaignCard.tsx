import { Card } from '@/components/ui/card';

interface ActiveCampaignCardProps {
  submission?: {
    id: string;
    current_metrics?: {
      views?: number;
      likes?: number;
    };
    campaigns: {
      campaign_name: string;
      campaign_description?: string;
      brand_image_url?: string;
      target_metrics: {
        views: number;
        likes: number;
      };
      reward_amount: number;
    };
  };
  isUpdating?: boolean;
}

export function ActiveCampaignCard({ submission, isUpdating = false }: ActiveCampaignCardProps) {
  if (!submission) {
    return (
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            📋
          </div>
          <p>No active campaigns</p>
        </div>
      </Card>
    );
  }

  // Get actual metrics values, starting at 0 for new submissions
  const currentViews = submission.current_metrics?.views || 0;
  const targetViews = submission.campaigns?.target_metrics?.views || 1000;
  const currentLikes = submission.current_metrics?.likes || 0;
  const targetLikes = submission.campaigns?.target_metrics?.likes || 50;

  const viewsPercentage = Math.min((currentViews / targetViews) * 100, 100);
  const likesPercentage = Math.min((currentLikes / targetLikes) * 100, 100);

  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-center gap-4">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {submission.campaigns?.brand_image_url ? (
            <img 
              src={submission.campaigns.brand_image_url} 
              alt={submission.campaigns?.campaign_name || 'Campaign'}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {submission.campaigns?.campaign_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          )}
        </div>

        {/* Campaign Name */}
        <div className="min-w-0 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {submission.campaigns?.campaign_name || 'Campaign'}
          </h3>
          <p className="text-sm text-gray-600">Crypto Investment Platform</p>
        </div>

        {/* Progress Section */}
        <div className="flex-1 px-8">
          <div className="grid grid-cols-2 gap-6">
            {/* Views Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">👁️ Views Progress</span>
                <span className="text-sm font-medium">{currentViews} / {targetViews.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isUpdating ? 'bg-blue-400 animate-pulse' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.max(viewsPercentage, 2)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{viewsPercentage.toFixed(1)}% complete</div>
            </div>

            {/* Likes Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">❤️ Likes Progress</span>
                <span className="text-sm font-medium">{currentLikes} / {targetLikes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isUpdating ? 'bg-red-400 animate-pulse' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.max(likesPercentage, 2)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{likesPercentage.toFixed(1)}% complete</div>
            </div>
          </div>
        </div>

        {/* Reward & Actions */}
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-bold text-gray-900">${((submission.campaigns?.reward_amount || 0) * 3400).toFixed(2)}</div>
          <div className="flex items-center gap-1 justify-end mt-1 mb-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <div className="text-xs text-gray-500">{(submission.campaigns?.reward_amount || 0).toFixed(5)} ETH reward</div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm text-orange-600">⏰ 3 days left</div>
        <div className="text-sm text-gray-500">💰 Instant payout on completion</div>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </Card>
  );
}