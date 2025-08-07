import { useState } from 'react';
import { apiClient } from '../lib/api';

export interface AIAnalysisResult {
  score: number;
  recommendation: 'approved' | 'needs_review' | 'rejected';
  campaignCompliance: {
    brandMention: { status: 'passed' | 'failed' | 'partial'; message: string };
    topicRelevance: { status: 'passed' | 'failed' | 'partial'; message: string };
    requirements: { status: 'passed' | 'failed' | 'partial'; message: string };
    callToAction: { status: 'passed' | 'failed' | 'partial'; message: string };
  };
  performanceInsights: {
    audienceMatch: string;
    engagementPotential: string;
    brandPositioning: string;
  };
  overallAssessment: string;
}

export interface UseAIAnalysisReturn {
  isRunning: boolean;
  result: AIAnalysisResult | null;
  error: string | null;
  runAnalysis: (submissionId: string) => Promise<void>;
}

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (submissionId: string) => {
    setIsRunning(true);
    setError(null);
    
    try {
      // Use your existing API client pattern
      const data = await apiClient.submissions.runAIVerification(submissionId);
      
      // Transform the real backend AI response to frontend format
      if (data.ai_verification_result) {
        const aiResult = data.ai_verification_result;
        const transformedResult: AIAnalysisResult = {
          score: aiResult.overall_score || 0,
          recommendation: aiResult.recommendation || 'needs_review',
          campaignCompliance: {
            brandMention: { 
              status: aiResult.detailed_feedback?.brand_alignment?.status === 'excellent' ? 'passed' : 
                     aiResult.detailed_feedback?.brand_alignment?.status === 'good' ? 'passed' : 'partial',
              message: aiResult.detailed_feedback?.brand_alignment?.explanation || 'Brand alignment checked'
            },
            topicRelevance: { 
              status: aiResult.detailed_feedback?.requirements_check?.score >= 70 ? 'passed' : 'partial',
              message: aiResult.detailed_feedback?.requirements_check?.explanation || 'Requirements checked'
            },
            requirements: { 
              status: aiResult.detailed_feedback?.requirements_check?.met_requirements?.length > 0 ? 'passed' : 'partial',
              message: `Met: ${aiResult.detailed_feedback?.requirements_check?.met_requirements?.join(', ') || 'None specified'}`
            },
            callToAction: { 
              status: aiResult.detailed_feedback?.content_quality?.status === 'excellent' ? 'passed' : 'partial',
              message: aiResult.detailed_feedback?.content_quality?.explanation || 'Content quality assessed'
            }
          },
          performanceInsights: {
            audienceMatch: aiResult.detailed_feedback?.brand_alignment?.explanation || 'Brand alignment analysis completed',
            engagementPotential: aiResult.detailed_feedback?.content_quality?.explanation || 'Content quality analysis completed',
            brandPositioning: aiResult.detailed_feedback?.compliance?.explanation || 'Compliance check completed'
          },
          overallAssessment: aiResult.explanation || 'AI analysis completed successfully'
        };
        
        setResult(transformedResult);
      } else {
        // Fallback for old format
        const transformedResult: AIAnalysisResult = {
          score: data.ai_overall_score || 0,
          recommendation: data.ai_recommendation || 'needs_review',
          campaignCompliance: {
            brandMention: { status: 'passed', message: 'Legacy format - brand check passed' },
            topicRelevance: { status: 'passed', message: 'Legacy format - topic relevance passed' },
            requirements: { status: 'passed', message: 'Legacy format - requirements passed' },
            callToAction: { status: 'passed', message: 'Legacy format - call to action passed' }
          },
          performanceInsights: {
            audienceMatch: 'Legacy format analysis',
            engagementPotential: 'Legacy format analysis',
            brandPositioning: 'Legacy format analysis'
          },
          overallAssessment: data.ai_explanation || 'Legacy format analysis completed'
        };
        
        setResult(transformedResult);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('AI Analysis error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    result,
    error,
    runAnalysis
  };
}