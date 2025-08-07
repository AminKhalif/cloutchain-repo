import { Card } from '@/components/ui/card';

interface CloutVisionCardProps {
  submission?: {
    ai_recommendation?: 'approved' | 'needs_review' | 'rejected';
    ai_overall_score?: number;
  };
  onAnalyze?: () => void;
}

export function CloutVisionCard({ submission, onAnalyze }: CloutVisionCardProps) {
  const hasAnalysis = submission?.ai_recommendation;
  
  return (
    <Card className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <span className="text-3xl">🤖</span>
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
        CloutVision Agent
      </h3>
      <p className="text-gray-600 mb-8">AI-powered content analysis and verification</p>

      {/* Status or Action */}
      {hasAnalysis ? (
        <div className={`p-6 rounded-2xl mb-6 ${
          submission.ai_recommendation === 'approved' 
            ? 'bg-green-50 border-2 border-green-200' :
          submission.ai_recommendation === 'needs_review' 
            ? 'bg-yellow-50 border-2 border-yellow-200' :
            'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="text-4xl mb-4">
            {submission.ai_recommendation === 'approved' ? '✅' :
             submission.ai_recommendation === 'needs_review' ? '⚠️' : '❌'}
          </div>
          <h4 className={`font-bold text-lg mb-2 ${
            submission.ai_recommendation === 'approved' ? 'text-green-800' :
            submission.ai_recommendation === 'needs_review' ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            {submission.ai_recommendation === 'approved' ? 'Content Approved!' :
             submission.ai_recommendation === 'needs_review' ? 'Needs Review' :
             'Content Rejected'}
          </h4>
          {submission.ai_overall_score && (
            <p className="text-sm text-gray-600">
              AI Score: <span className="font-semibold">{submission.ai_overall_score}/100</span>
            </p>
          )}
        </div>
      ) : (
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-dashed border-purple-200 mb-6">
          <div className="text-4xl mb-4">🔍</div>
          <h4 className="font-semibold text-purple-700 mb-2">Ready for Analysis</h4>
          <p className="text-sm text-purple-600">Upload your content to get AI insights and verification</p>
        </div>
      )}

      {/* Action Button */}
      <button 
        onClick={onAnalyze}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg"
      >
        {hasAnalysis ? 'Re-analyze Content' : '✨ Analyze with CloutVision'}
      </button>
    </Card>
  );
}