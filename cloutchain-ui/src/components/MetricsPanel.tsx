interface MetricsPanelProps {
  currentMetrics: {
    views?: number;
    likes?: number;
  };
  targetMetrics: {
    views?: number;
    likes?: number;
  };
}

export function MetricsPanel({ currentMetrics, targetMetrics }: MetricsPanelProps) {
  const viewsReached = (currentMetrics.views || 0) >= (targetMetrics.views || 0);
  const likesReached = (currentMetrics.likes || 0) >= (targetMetrics.likes || 0);
  const allTargetsMet = viewsReached && likesReached;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        📊 Performance Metrics
      </h4>
      
      <div className="space-y-4">
        {targetMetrics.views && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Views</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                {(currentMetrics.views || 0).toLocaleString()} / {targetMetrics.views.toLocaleString()}
              </span>
              {viewsReached && <span className="text-green-500">✅</span>}
            </div>
          </div>
        )}
        
        {targetMetrics.likes && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Likes</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                {(currentMetrics.likes || 0).toLocaleString()} / {targetMetrics.likes.toLocaleString()}
              </span>
              {likesReached && <span className="text-green-500">✅</span>}
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-200">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            allTargetsMet ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {allTargetsMet ? '🎯 Targets Reached!' : '📈 Growing...'}
          </div>
        </div>
      </div>
    </div>
  );
}