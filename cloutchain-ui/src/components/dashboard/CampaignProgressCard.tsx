import { Card } from '@/components/ui/card';

interface CampaignProgressCardProps {
  aiVerified: boolean;
  engagementReached: boolean;
  activeCampaigns: number;
  totalViews: number;
}

export function CampaignProgressCard({ 
  aiVerified, 
  engagementReached, 
  activeCampaigns, 
  totalViews 
}: CampaignProgressCardProps) {
  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Progress</h3>
          <div className="text-sm text-gray-500">
            Rank #1
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Active Campaigns</span>
            <span className="font-medium text-gray-900">{activeCampaigns}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Views</span>
            <span className="font-medium text-gray-900">{totalViews}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Success Rate</span>
            <span className="font-medium text-gray-900">99%</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Requirements Checklist */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Requirements for Payout</h4>
          
          {/* AI Verification */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              aiVerified 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {aiVerified ? '✓' : '○'}
            </div>
            <span className={`text-sm ${
              aiVerified ? 'text-green-700 font-medium' : 'text-gray-600'
            }`}>
              AI Agent Verified
            </span>
          </div>

          {/* Engagement Target */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              engagementReached 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {engagementReached ? '✓' : '○'}
            </div>
            <span className={`text-sm ${
              engagementReached ? 'text-green-700 font-medium' : 'text-gray-600'
            }`}>
              Engagement Target Reached
            </span>
          </div>
        </div>

        {/* Progress Status */}
        <div className={`mt-4 p-3 rounded-lg border-l-4 ${
          aiVerified && engagementReached
            ? 'bg-green-50 border-green-400'
            : 'bg-yellow-50 border-yellow-400'
        }`}>
          <p className={`text-sm font-medium ${
            aiVerified && engagementReached
              ? 'text-green-700'
              : 'text-yellow-700'
          }`}>
            {aiVerified && engagementReached
              ? '🎉 Ready for payout!'
              : '⏳ Complete requirements above'}
          </p>
        </div>
      </div>
    </Card>
  );
}