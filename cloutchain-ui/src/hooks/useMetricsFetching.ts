import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface MetricsResult {
  views: number;
  likes: number;
  targetReached: boolean;
}

export function useMetricsFetching() {
  const [isFetching, setIsFetching] = useState(false);

  const fetchMetrics = async (submissionId: string): Promise<MetricsResult | null> => {
    if (!submissionId) {
      toast.error('No submission available to fetch metrics');
      return null;
    }

    setIsFetching(true);

    try {
      const result = await apiClient.submissions.updateMetrics(submissionId);
      
      const metrics: MetricsResult = {
        views: result.current_metrics?.views || 0,
        likes: result.current_metrics?.likes || 0,
        targetReached: result.target_reached || false
      };

      toast.success('📊 Metrics updated successfully!');
      return metrics;
      
    } catch (error: any) {
      console.error('Metrics fetch failed:', error);
      toast.error(`Failed to fetch metrics: ${error.message}`);
      return null;
    } finally {
      setIsFetching(false);
    }
  };

  return {
    isFetching,
    fetchMetrics
  };
}