import { Card } from '@/components/ui/card';

interface UpdateAnalyticsCardProps {
  onUpdateAnalytics: () => void;
  isUpdating?: boolean;
}

export function UpdateAnalyticsCard({ onUpdateAnalytics, isUpdating = false }: UpdateAnalyticsCardProps) {
  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📊</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Update Campaign Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">Refresh views, likes, and engagement metrics from TikTok</p>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl transition-all disabled:opacity-50"
            onClick={onUpdateAnalytics}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Analytics'}
          </button>
        </div>
      </div>
    </Card>
  );
}