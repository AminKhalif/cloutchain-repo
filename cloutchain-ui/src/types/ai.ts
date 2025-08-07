export interface ComplianceItem {
  status: 'passed' | 'failed' | 'partial';
  message: string;
}

export interface AIAnalysisResult {
  campaignCompliance: {
    brandMention: ComplianceItem;
    topicRelevance: ComplianceItem;
    requirements: ComplianceItem;
    callToAction: ComplianceItem;
  };
  performanceInsights: {
    audienceMatch: string;
    engagementPotential: string;
    brandPositioning: string;
  };
  overallAssessment: string;
}

export interface AIAnalysisResponse {
  score: number;
  recommendation: 'approved' | 'needs_review' | 'rejected';
  analysisResult: AIAnalysisResult;
}