import { useState } from 'react';
import { AIAnalysisResult } from '../hooks/useAIAnalysis';

interface SecureTheBagProps {
  rewardAmount: number;
  aiResult?: AIAnalysisResult;
  metricsReached: boolean;
  onPaymentSuccess?: () => void;
  isProcessing?: boolean;
}

export function SecureTheBag({
  rewardAmount,
  aiResult,
  metricsReached,
  onPaymentSuccess,
  isProcessing = false
}: SecureTheBagProps) {
  const aiApproved = aiResult?.recommendation === 'approved';
  const allRequirementsMet = aiApproved && metricsReached;
  const ethPrice = 2300; // Mock ETH price
  
  const handleSecureBag = async () => {
    if (allRequirementsMet && onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  return (
    <div className="relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl blur-sm bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200"></div>
      
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-200 shadow-xl">
        <div className="text-center">
          
          {/* Money Bag Icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl">💰</span>
          </div>
          
          <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            Secure the Bag
          </h3>
          <p className="text-slate-600 mb-4 text-sm">Claim your rewards</p>
          
          {/* Reward Info */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-700 font-medium text-sm">Potential Reward:</span>
              <span className="font-bold text-xl text-slate-900">{rewardAmount} ETH</span>
            </div>
            <div className="text-xs text-slate-600">
              ≈ ${(rewardAmount * ethPrice).toFixed(2)} USD
            </div>
          </div>
          
          {/* Requirements Checklist */}
          <div className="space-y-3 mb-6">
            {/* AI Approval Checkbox */}
            <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
              aiApproved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  aiApproved ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <span className="text-white text-sm font-bold">
                    {aiApproved ? '✓' : '○'}
                  </span>
                </div>
                <span className="font-medium text-gray-800">CloutVision AI Approved</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                aiApproved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {aiApproved ? 'APPROVED' : 'PENDING'}
              </span>
            </div>

            {/* Metrics Checkbox */}
            <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
              metricsReached ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  metricsReached ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <span className="text-white text-sm font-bold">
                    {metricsReached ? '✓' : '○'}
                  </span>
                </div>
                <span className="font-medium text-gray-800">Engagement Goals Reached</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                metricsReached ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {metricsReached ? 'REACHED' : 'PENDING'}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          {allRequirementsMet ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-green-700 font-semibold mb-1">🎉 Ready for Payment!</div>
                <p className="text-green-600 text-sm">All requirements met. Click to claim your reward.</p>
              </div>
              
              <button
                onClick={handleSecureBag}
                disabled={isProcessing}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🔒</span>
                    <span>Secure the Bag</span>
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="text-orange-700 font-semibold mb-1">⏳ Requirements Pending</div>
              <p className="text-orange-600 text-sm">
                {!aiApproved && !metricsReached ? 'Complete AI verification and reach engagement goals to unlock payment' :
                 !aiApproved ? 'Run CloutVision AI analysis first' :
                 'Check metrics to see if engagement goals are reached'}
              </p>
            </div>
          )}
          
          <p className="text-xs text-slate-500 mt-4">
            Smart contract verifies metrics automatically
          </p>
        </div>
      </div>
    </div>
  );
}