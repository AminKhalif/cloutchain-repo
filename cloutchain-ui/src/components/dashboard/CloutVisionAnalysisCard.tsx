import { Card } from '@/components/ui/card';

interface CloutVisionAnalysisCardProps {
  submission?: {
    id: string;
    ai_verification_status?: string;
    ai_recommendation?: 'approved' | 'needs_review' | 'rejected';
    ai_overall_score?: number;
  };
  onViewDetails: (submissionId: string) => void;
  onAnalyzeContent: () => void;
}

export function CloutVisionAnalysisCard({ 
  submission, 
  onViewDetails, 
  onAnalyzeContent 
}: CloutVisionAnalysisCardProps) {
  const hasAnalysis = submission?.ai_verification_status;

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🤖</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">CloutVision Analysis</h3>
          <p className="text-gray-600 text-sm mb-4">
            {hasAnalysis ? `Status: ${submission.ai_verification_status}` : 'AI-powered content analysis and verification'}
          </p>
          <button 
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-xl transition-all"
            onClick={() => {
              if (hasAnalysis && submission) {
                onViewDetails(submission.id);
              } else {
                onAnalyzeContent();
              }
            }}
          >
            {hasAnalysis ? 'View Details' : 'Analyze Content'}
          </button>
        </div>
      </div>
    </Card>
  );
}