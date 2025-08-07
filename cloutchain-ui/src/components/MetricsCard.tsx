import { Eye, Heart, MessageCircle, Share2, Target, TrendingUp } from 'lucide-react';

interface MetricsCardProps {
  current: number;
  target: number;
  type: 'views' | 'likes' | 'comments' | 'shares';
  className?: string;
}

const metricConfig = {
  views: {
    icon: Eye,
    label: 'Views',
    color: 'blue',
    bgGradient: 'from-blue-50 to-indigo-50',
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-500',
    targetReachedColor: 'from-green-400 to-emerald-500'
  },
  likes: {
    icon: Heart,
    label: 'Likes',
    color: 'pink',
    bgGradient: 'from-pink-50 to-rose-50',
    iconColor: 'text-pink-500',
    progressColor: 'bg-pink-500',
    targetReachedColor: 'from-pink-400 to-rose-500'
  },
  comments: {
    icon: MessageCircle,
    label: 'Comments',
    color: 'purple',
    bgGradient: 'from-purple-50 to-violet-50',
    iconColor: 'text-purple-500',
    progressColor: 'bg-purple-500',
    targetReachedColor: 'from-purple-400 to-violet-500'
  },
  shares: {
    icon: Share2,
    label: 'Shares',
    color: 'green',
    bgGradient: 'from-green-50 to-emerald-50',
    iconColor: 'text-green-500',
    progressColor: 'bg-green-500',
    targetReachedColor: 'from-green-400 to-emerald-500'
  }
};

export function MetricsCard({ current, target, type, className = '' }: MetricsCardProps) {
  const config = metricConfig[type];
  const Icon = config.icon;
  const safeCurrent = current || 0;
  const safeTarget = target || 0;
  const progress = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;
  const isTargetReached = safeCurrent >= safeTarget && safeTarget > 0;
  const percentageComplete = Math.round(progress);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${className}`}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isTargetReached ? config.targetReachedColor : config.bgGradient}`}>
        {isTargetReached && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        )}
      </div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${isTargetReached ? 'bg-white/30' : 'bg-white/50'} backdrop-blur-sm`}>
            <Icon size={24} className={isTargetReached ? 'text-white' : config.iconColor} />
          </div>
          {isTargetReached && (
            <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
              <Target size={14} className="text-white" />
              <span className="text-xs font-medium text-white">TARGET HIT!</span>
            </div>
          )}
        </div>

        {/* Numbers */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-3xl font-bold ${isTargetReached ? 'text-white' : 'text-gray-900'}`}>
              {safeCurrent.toLocaleString()}
            </span>
            {safeTarget > 0 && (
              <span className={`text-sm ${isTargetReached ? 'text-white/80' : 'text-gray-500'}`}>
                / {safeTarget.toLocaleString()}
              </span>
            )}
          </div>
          <p className={`text-sm font-medium ${isTargetReached ? 'text-white/90' : 'text-gray-600'}`}>
            {config.label}
            {safeTarget > 0 && ` • ${percentageComplete}% complete`}
          </p>
        </div>

        {/* Progress Bar */}
        {safeTarget > 0 && (
          <div className="space-y-2">
            <div className={`h-2 rounded-full ${isTargetReached ? 'bg-white/30' : 'bg-white/50'} overflow-hidden`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isTargetReached ? 'bg-white' : config.progressColor
                }`}
                style={{ width: `${progress}%` }}
              >
                {isTargetReached && (
                  <div className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                )}
              </div>
            </div>
            
            {/* Growth Indicator */}
            {safeCurrent > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className={isTargetReached ? 'text-white/80' : 'text-gray-400'} />
                <span className={`text-xs ${isTargetReached ? 'text-white/80' : 'text-gray-500'}`}>
                  {safeCurrent >= safeTarget ? 'Target exceeded!' : `${(safeTarget - safeCurrent).toLocaleString()} to go`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* No Target Set */}
        {safeTarget === 0 && (
          <div className="text-xs text-gray-500 italic">No target set</div>
        )}
      </div>
    </div>
  );
}