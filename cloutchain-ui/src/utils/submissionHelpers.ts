// Pure functions for submission data calculations

export interface AIResult {
  score: number;
  recommendation: 'approved' | 'needs_review' | 'rejected';
  campaignCompliance: any;
  performanceInsights: any;
  overallAssessment: string;
}

export function getAIResult(submission: any): AIResult | null {
  if (!submission.ai_recommendation) return null;
  
  return {
    score: submission.ai_overall_score || 0,
    recommendation: submission.ai_recommendation,
    campaignCompliance: {
      brandMention: { status: 'passed' as const, message: 'Brand requirements met' },
      topicRelevance: { status: 'passed' as const, message: 'Content relevant' },
      requirements: { status: 'passed' as const, message: 'Requirements satisfied' },
      callToAction: { status: 'passed' as const, message: 'Call to action present' }
    },
    performanceInsights: {
      audienceMatch: 'Analysis completed',
      engagementPotential: 'Analysis completed', 
      brandPositioning: 'Analysis completed'
    },
    overallAssessment: submission.ai_explanation || 'Analysis completed'
  };
}

export function checkMetricsReached(current: any, target: any): boolean {
  const viewsReached = (current?.views || 0) >= (target?.views || 0);
  const likesReached = (current?.likes || 0) >= (target?.likes || 0);
  return viewsReached && likesReached;
}

export function getCurrentMetrics(submission: any) {
  return submission?.current_metrics && Object.keys(submission.current_metrics).length > 0 
    ? submission.current_metrics 
    : { views: 0, likes: 0 };
}

export function getTargetMetrics(submission: any) {
  return submission?.campaigns?.target_metrics || { views: 60, likes: 5 };
}