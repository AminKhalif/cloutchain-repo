import { useState } from 'react';
import { apiClient } from '../lib/api';

export interface MetricsData {
  current: {
    views: number;
    likes: number;
  };
  target: {
    views: number;
    likes: number;
  };
  targetReached: boolean;
}

export interface UseMetricsTrackerReturn {
  isChecking: boolean;
  metrics: MetricsData | null;
  error: string | null;
  checkMetrics: (submissionId: string) => Promise<void>;
}

export function useMetricsTracker(): UseMetricsTrackerReturn {
  const [isChecking, setIsChecking] = useState(false);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkMetrics = async (submissionId: string) => {
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('🔄 Calling updateMetrics API...');
      const result = await apiClient.submissions.updateMetrics(submissionId);
      console.log('✅ API Response:', result);
      console.log('📋 Target path:', result.submission?.campaigns?.target_metrics);
      
      setMetrics({
        current: result.metrics || { views: 0, likes: 0 },
        target: result.submission?.campaigns?.target_metrics || { views: 0, likes: 0 },
        targetReached: result.target_reached || false
      });
      
      console.log('📊 Set metrics to:', {
        current: result.metrics || { views: 0, likes: 0 },
        target: result.submission?.campaigns?.target_metrics || { views: 0, likes: 0 },
        targetReached: result.target_reached || false
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check metrics');
      console.error('Metrics check error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    metrics,
    error,
    checkMetrics
  };
}