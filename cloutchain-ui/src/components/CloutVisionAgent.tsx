import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface AIAnalysisResult {
  ai_overall_score: number;
  ai_recommendation: 'approved' | 'needs_review' | 'rejected';
  ai_explanation: string;
  ai_verification_result: {
    overall_score: number;
    recommendation: 'approved' | 'needs_review' | 'rejected';
    explanation: string;
    detailed_feedback: {
      compliance: {
        score: number;
        status: string;
        explanation: string;
      };
      brand_alignment: {
        score: number;
        status: string;
        explanation: string;
        suggestions: string[];
      };
      content_quality: {
        score: number;
        status: string;
        strengths: string[];
        explanation: string;
        improvements: string[];
      };
      requirements_check: {
        score: number;
        explanation: string;
        met_requirements: string[];
        missing_requirements: string[];
      };
    };
  };
}

interface CloutVisionAgentProps {
  submissionId?: string;
  onAnalysisComplete?: (result: AIAnalysisResult) => void;
  disabled?: boolean;
  analysisResult?: AIAnalysisResult | null;
  showDetails?: boolean;
  onShowDetailsChange?: (show: boolean) => void;
}

export function CloutVisionAgent({ 
  submissionId, 
  onAnalysisComplete, 
  disabled = false, 
  analysisResult = null, 
  showDetails = false, 
  onShowDetailsChange 
}: CloutVisionAgentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const result = analysisResult;
  const handleShowDetailsChange = (show: boolean) => {
    onShowDetailsChange?.(show);
  };

  const handleAnalyze = async () => {
    if (!submissionId) {
      toast.error('No submission available to analyze');
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysisResult = await apiClient.submissions.runAIVerification(submissionId);
      
      toast.success('✅ AI analysis completed');
      
      // Notify parent component
      onAnalysisComplete?.(analysisResult);
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs_review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
      case 'partial':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 h-fit">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🤖</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2">CloutVision Agent</h3>
          <p className="text-gray-600 text-sm mb-4">AI analyzes your submitted content for approval</p>
          
          {!result ? (
            <button 
              onClick={handleAnalyze}
              disabled={disabled || isAnalyzing || !submissionId}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-semibold py-2 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Content...
                </div>
              ) : (
                'Analyze Content'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Analysis Result Summary */}
              <div className={`p-4 rounded-xl border-2 ${getRecommendationColor(result.ai_recommendation || 'rejected')}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {result.ai_recommendation === 'approved' ? 'Content Approved!' :
                       result.ai_recommendation === 'needs_review' ? 'Needs Review' :
                       'Content Rejected'}
                    </h4>
                    <p className="text-sm mt-1">AI Score: {result.ai_overall_score || 0}/100</p>
                  </div>
                  <div className="text-2xl">
                    {result.ai_recommendation === 'approved' ? '✅' :
                     result.ai_recommendation === 'needs_review' ? '⚠️' : '❌'}
                  </div>
                </div>
              </div>

              {/* View Details Toggle */}
              <button
                onClick={() => handleShowDetailsChange(!showDetails)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
              >
                {showDetails ? '▲ Hide Analysis Details' : '▼ View Analysis Details'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analysis Results - Outside the flex container to prevent layout issues */}
      {result && showDetails && result?.ai_verification_result && (
        <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-xl">
          {/* Overall Assessment */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-3">AI Assessment</h5>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{result.ai_explanation}</p>
            </div>
          </div>

          {/* Detailed Feedback */}
          {result.ai_verification_result.detailed_feedback && (
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-900">Detailed Analysis</h5>
              
              {/* Compliance */}
              {result.ai_verification_result.detailed_feedback.compliance && (
                <div className={`p-4 rounded-lg border ${getStatusColor(result.ai_verification_result.detailed_feedback.compliance.status)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="font-medium">Campaign Compliance</h6>
                    <span className="text-sm font-bold uppercase">
                      {result.ai_verification_result.detailed_feedback.compliance.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Score: {result.ai_verification_result.detailed_feedback.compliance.score}/100
                  </p>
                  <p className="text-sm text-gray-600">
                    {result.ai_verification_result.detailed_feedback.compliance.explanation}
                  </p>
                </div>
              )}

              {/* Brand Alignment */}
              {result.ai_verification_result.detailed_feedback.brand_alignment && (
                <div className={`p-4 rounded-lg border ${getStatusColor(result.ai_verification_result.detailed_feedback.brand_alignment.status)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="font-medium">Brand Alignment</h6>
                    <span className="text-sm font-bold uppercase">
                      {result.ai_verification_result.detailed_feedback.brand_alignment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Score: {result.ai_verification_result.detailed_feedback.brand_alignment.score}/100
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {result.ai_verification_result.detailed_feedback.brand_alignment.explanation}
                  </p>
                  {result.ai_verification_result.detailed_feedback.brand_alignment.suggestions?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {result.ai_verification_result.detailed_feedback.brand_alignment.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Content Quality */}
              {result.ai_verification_result.detailed_feedback.content_quality && (
                <div className={`p-4 rounded-lg border ${getStatusColor(result.ai_verification_result.detailed_feedback.content_quality.status)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="font-medium">Content Quality</h6>
                    <span className="text-sm font-bold uppercase">
                      {result.ai_verification_result.detailed_feedback.content_quality.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Score: {result.ai_verification_result.detailed_feedback.content_quality.score}/100
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {result.ai_verification_result.detailed_feedback.content_quality.explanation}
                  </p>
                  
                  {result.ai_verification_result.detailed_feedback.content_quality.strengths?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                      <ul className="text-xs text-green-600 list-disc list-inside">
                        {result.ai_verification_result.detailed_feedback.content_quality.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.ai_verification_result.detailed_feedback.content_quality.improvements?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-yellow-700 mb-1">Improvements:</p>
                      <ul className="text-xs text-yellow-600 list-disc list-inside">
                        {result.ai_verification_result.detailed_feedback.content_quality.improvements.map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Requirements Check */}
              {result.ai_verification_result.detailed_feedback.requirements_check && (
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <h6 className="font-medium mb-2">Requirements Check</h6>
                  <p className="text-sm text-gray-700 mb-2">
                    Score: {result.ai_verification_result.detailed_feedback.requirements_check.score}/100
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {result.ai_verification_result.detailed_feedback.requirements_check.explanation}
                  </p>
                  
                  {result.ai_verification_result.detailed_feedback.requirements_check.met_requirements?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-green-700 mb-1">✅ Met Requirements:</p>
                      <ul className="text-xs text-green-600 list-disc list-inside">
                        {result.ai_verification_result.detailed_feedback.requirements_check.met_requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.ai_verification_result.detailed_feedback.requirements_check.missing_requirements?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">❌ Missing Requirements:</p>
                      <ul className="text-xs text-red-600 list-disc list-inside">
                        {result.ai_verification_result.detailed_feedback.requirements_check.missing_requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Re-analyze Button */}
          <button 
            onClick={() => {
              onAnalysisComplete?.(null);
              handleShowDetailsChange(false);
            }}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
          >
            🔄 Run New Analysis
          </button>
        </div>
      )}
    </Card>
  );
}