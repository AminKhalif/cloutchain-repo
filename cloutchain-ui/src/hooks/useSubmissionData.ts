import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface SubmissionData {
  id: string;
  ai_recommendation?: 'approved' | 'needs_review' | 'rejected';
  ai_overall_score?: number;
  ai_explanation?: string;
  current_metrics?: {
    views?: number;
    likes?: number;
  };
  campaigns?: {
    target_metrics?: {
      views?: number;
      likes?: number;
    };
  };
}

export function useSubmissionData(submissionId: string) {
  const [data, setData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);
      const updatedSubmission = await apiClient.submissions.getById(submissionId);
      setData(updatedSubmission);
    } catch (error) {
      console.error('Error refreshing submission data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      refreshData();
    }
  }, [submissionId]);

  return {
    data,
    loading,
    refresh: refreshData
  };
}