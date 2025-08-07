import { useMetricsTracker } from '../hooks/useMetricsTracker';

interface ImpactTrackerProps {
  submissionId: string;
  currentMetrics?: {
    views?: number;
    likes?: number;
  };
  targetMetrics?: {
    views?: number;
    likes?: number;
  };
}

export function ImpactTracker({ submissionId, currentMetrics, targetMetrics }: ImpactTrackerProps) {
  const { isChecking, metrics, error, checkMetrics } = useMetricsTracker();

  const handleCheckMetrics = () => {
    checkMetrics(submissionId);
  };

  // Use hook data if available, otherwise fallback to props
  const displayMetrics = metrics || {
    current: { 
      views: currentMetrics?.views || 0, 
      likes: currentMetrics?.likes || 0 
    },
    target: { 
      views: targetMetrics?.views || 0, 
      likes: targetMetrics?.likes || 0 
    },
    targetReached: false
  };

  const viewsReached = (displayMetrics.current.views || 0) >= (displayMetrics.target.views || 0);
  const likesReached = (displayMetrics.current.likes || 0) >= (displayMetrics.target.likes || 0);

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 100;
    return Math.min(100, (current / target) * 100);
  };

  return (
    <div className="relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl blur-sm bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"></div>
      
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Impact Tracker
          </h3>
          <p className="text-gray-600 text-sm">Monitor your content performance</p>
        </div>

        {/* Current Metrics Display */}
        <div className="space-y-4 mb-6">
          {/* Views */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                👁️ Views
              </span>
              <span className="text-lg font-bold text-gray-900">
                {(displayMetrics.current.views || 0).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-700 ${
                  viewsReached ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}
                style={{ width: `${getProgressPercentage(displayMetrics.current.views, displayMetrics.target.views)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Target: {(displayMetrics.target.views || 0).toLocaleString()}</span>
              <span>{viewsReached ? '✅ Reached!' : `${Math.max(0, (displayMetrics.target.views || 0) - (displayMetrics.current.views || 0))} more needed`}</span>
            </div>
          </div>

          {/* Likes */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                ❤️ Likes
              </span>
              <span className="text-lg font-bold text-gray-900">
                {(displayMetrics.current.likes || 0).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-700 ${
                  likesReached ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-pink-400 to-pink-500'
                }`}
                style={{ width: `${getProgressPercentage(displayMetrics.current.likes, displayMetrics.target.likes)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Target: {(displayMetrics.target.likes || 0).toLocaleString()}</span>
              <span>{likesReached ? '✅ Reached!' : `${Math.max(0, (displayMetrics.target.likes || 0) - (displayMetrics.current.likes || 0))} more needed`}</span>
            </div>
          </div>
        </div>

        {/* Check Metrics Button */}
        <button
          onClick={handleCheckMetrics}
          disabled={isChecking}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isChecking ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Checking Metrics...
            </div>
          ) : (
            '🔄 Check Latest Metrics'
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Click to fetch real-time TikTok metrics
        </p>
      </div>
    </div>
  );
}