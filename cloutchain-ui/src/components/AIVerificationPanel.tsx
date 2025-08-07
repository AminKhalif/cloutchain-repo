import { useState, useEffect } from 'react';

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

interface AIVerificationPanelProps {
  submissionId: string;
  onAnalysisComplete?: () => void;
  existingResult?: {
    ai_verification_status?: string;
    ai_overall_score?: number;
    ai_recommendation?: 'approved' | 'needs_review' | 'rejected';
    ai_explanation?: string;
  };
}

export function AIVerificationPanel({ submissionId, onAnalysisComplete, existingResult }: AIVerificationPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use existing result if available
  const finalResult = result || (existingResult?.ai_recommendation ? {
    score: existingResult.ai_overall_score || 0,
    recommendation: existingResult.ai_recommendation,
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
    overallAssessment: existingResult.ai_explanation || 'Analysis completed'
  } : null);
  
  const hasResults = finalResult !== null;

  useEffect(() => {
    if (isRunning) {
      const steps = [
        'Analyzing video content...',
        'Checking brand alignment...',
        'Evaluating engagement potential...',
        'Generating insights...'
      ];
      
      const interval = setInterval(() => {
        setAnimationStep(prev => (prev + 1) % steps.length);
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const runAnalysis = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      // Mock analysis for now - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setResult({
        score: 95,
        recommendation: 'approved',
        campaignCompliance: {
          brandMention: { status: 'passed', message: 'Brand requirements met' },
          topicRelevance: { status: 'passed', message: 'Content relevant' },
          requirements: { status: 'passed', message: 'Requirements satisfied' },
          callToAction: { status: 'passed', message: 'Call to action present' }
        },
        performanceInsights: {
          audienceMatch: 'Excellent match for target audience',
          engagementPotential: 'High engagement potential detected',
          brandPositioning: 'Strong brand alignment'
        },
        overallAssessment: 'Content meets all campaign requirements and shows strong potential for engagement.'
      });
      
      if (onAnalysisComplete) {
        setTimeout(onAnalysisComplete, 500);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getAnalysisSteps = () => [
    'Analyzing video content...',
    'Checking brand alignment...',
    'Evaluating engagement potential...',
    'Generating insights...'
  ];

  const getStatusEmoji = (recommendation?: string) => {
    if (!recommendation) return '🤖';
    switch (recommendation) {
      case 'approved': return '✅';
      case 'needs_review': return '⚠️';
      case 'rejected': return '❌';
      default: return '🤖';
    }
  };

  function renderComplianceItem(title: string, item: { status: 'passed' | 'failed' | 'partial'; message: string }) {
    const getStatusColor = () => {
      switch (item.status) {
        case 'passed': return { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-500', text: 'text-green-600', symbol: '✓' };
        case 'partial': return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'bg-yellow-500', text: 'text-yellow-600', symbol: '!' };
        case 'failed': return { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-500', text: 'text-red-600', symbol: '✗' };
      }
    };
    
    const getStatusText = () => {
      switch (item.status) {
        case 'passed': return 'PASSED';
        case 'partial': return 'PARTIAL';
        case 'failed': return 'FAILED';
      }
    };
    
    const colors = getStatusColor();
    
    return (
      <div key={title} className={`flex items-center justify-between p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 ${colors.icon} rounded-full flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{colors.symbol}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-800">{title}</span>
            <p className="text-sm text-gray-600">{item.message}</p>
          </div>
        </div>
        <span className={`${colors.text} font-bold`}>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CloutVision Agent Button */}
      <div className="relative">
        <div className={`absolute inset-0 rounded-2xl blur-sm transition-all duration-500 ${
          isRunning 
            ? 'bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 animate-pulse' 
            : 'bg-gradient-to-r from-purple-200 to-blue-200'
        }`}></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
          <div className="text-center">
            <div className={`w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
              isRunning ? 'animate-bounce' : ''
            }`}>
              <span className="text-2xl">{isRunning ? '🔍' : '🤖'}</span>
            </div>
            
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              CloutVision Agent
            </h3>
            <p className="text-gray-600 mb-6">AI-powered content analysis and verification</p>
            
            {!hasResults ? (
              <div className="space-y-4">
                <button
                  onClick={runAnalysis}
                  disabled={isRunning}
                  className={`px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none ${
                    isRunning ? 'animate-pulse' : ''
                  }`}
                >
                  {isRunning ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="animate-pulse">{getAnalysisSteps()[animationStep]}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      ✨ Analyze with CloutVision
                    </div>
                  )}
                </button>
                
                {isRunning && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <span className="font-semibold text-purple-700">Processing...</span>
                    </div>
                    <div className="space-y-2">
                      {getAnalysisSteps().map((step, index) => (
                        <div key={index} className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                          index <= animationStep ? 'text-purple-600' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index < animationStep ? 'bg-green-500' :
                            index === animationStep ? 'bg-purple-500 animate-pulse' :
                            'bg-gray-300'
                          }`}></div>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border-2 transition-all duration-500 transform scale-105 ${
                  finalResult.recommendation === 'approved' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700' :
                  finalResult.recommendation === 'needs_review' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-700' :
                  'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700'
                }`}>
                  <div className={`text-3xl animate-bounce ${
                    finalResult.recommendation === 'approved' ? 'animate-pulse' : ''
                  }`}>{getStatusEmoji(finalResult.recommendation)}</div>
                  <div>
                    <span className="font-bold text-xl">
                      {finalResult.recommendation === 'approved' ? 'Content Approved!' :
                       finalResult.recommendation === 'needs_review' ? 'Needs Review' :
                       'Content Rejected'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-sm opacity-75">AI Score:</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        finalResult.score >= 90 ? 'bg-green-200 text-green-800' :
                        finalResult.score >= 70 ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {finalResult.score}/100
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <span>{showDetails ? '▲ Hide Details' : '▼ View AI Analysis'}</span>
                </button>
              </div>
            )}

            {error && (
              <div className="px-6 py-4 rounded-xl border-l-4 bg-red-50 border-red-400 mt-4">
                <div className="flex items-center gap-2 mb-3 font-semibold text-red-700">
                  <span className="text-lg">❌</span>
                  Analysis Failed:
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CloutVision Details (Expandable) */}
      {hasResults && showDetails && finalResult && (
        <div className="relative animate-slide-in">
          <div className={`absolute inset-0 rounded-2xl blur-sm bg-gradient-to-r ${
            finalResult.recommendation === 'approved' ? 'from-green-200 to-emerald-200' :
            finalResult.recommendation === 'needs_review' ? 'from-yellow-200 to-orange-200' :
            'from-red-200 to-pink-200'
          }`}></div>
          
          <div className={`relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 shadow-xl ${
            finalResult.recommendation === 'approved' ? 'border-green-200' :
            finalResult.recommendation === 'needs_review' ? 'border-yellow-200' :
            'border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                finalResult.recommendation === 'approved' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                finalResult.recommendation === 'needs_review' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                'bg-gradient-to-r from-red-400 to-pink-400'
              }`}>
                <span className="text-white text-xl">{getStatusEmoji(finalResult.recommendation)}</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">CloutVision Analysis</h4>
                <p className="text-sm text-gray-600">AI-generated content insights</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Campaign-Specific Analysis */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  Campaign Compliance Analysis
                </h5>
                
                <div className="space-y-3">
                  {renderComplianceItem('Brand Mention', finalResult.campaignCompliance.brandMention)}
                  {renderComplianceItem('Topic Relevance', finalResult.campaignCompliance.topicRelevance)}
                  {renderComplianceItem('Requirements', finalResult.campaignCompliance.requirements)}
                  {renderComplianceItem('Call-to-Action', finalResult.campaignCompliance.callToAction)}
                </div>
              </div>

              {/* Smart Insights */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🧠</span>
                  AI Performance Insights
                </h5>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-semibold text-gray-800">Target Audience Match:</span>
                      <p className="text-sm text-gray-600">{finalResult.performanceInsights.audienceMatch}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-semibold text-gray-800">Engagement Potential:</span>
                      <p className="text-sm text-gray-600">{finalResult.performanceInsights.engagementPotential}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-semibold text-gray-800">Brand Positioning:</span>
                      <p className="text-sm text-gray-600">{finalResult.performanceInsights.brandPositioning}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Assessment */}
              <div className={`px-6 py-4 rounded-xl border-l-4 ${
                finalResult.recommendation === 'approved' ? 'bg-green-50 border-green-400' :
                finalResult.recommendation === 'needs_review' ? 'bg-yellow-50 border-yellow-400' :
                'bg-red-50 border-red-400'
              }`}>
                <div className={`flex items-center gap-2 mb-3 font-semibold ${
                  finalResult.recommendation === 'approved' ? 'text-green-700' :
                  finalResult.recommendation === 'needs_review' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  <span className="text-lg">🎯</span>
                  Final Assessment:
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{finalResult.overallAssessment}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}