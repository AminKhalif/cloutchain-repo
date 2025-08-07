import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ExternalLink, Zap, DollarSign, Target, CheckCircle } from 'lucide-react';

interface BlockchainMetricsCheckerProps {
  submission?: {
    tiktokUrl: string;
    campaignId: number;
    creatorAddress: string;
  };
  onMetricsUpdate?: (result: any) => void;
}

export const BlockchainMetricsChecker: React.FC<BlockchainMetricsCheckerProps> = ({
  submission,
  onMetricsUpdate
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Quick test with Blai video
  const handleBlaiTest = async () => {
    setIsChecking(true);
    
    try {
      toast.success('Fetching TikTok metrics and checking payment conditions...');
      const result = await apiClient.blockchain.testBlai();
      
      setLastResult(result);
      if (onMetricsUpdate) onMetricsUpdate(result);
      
      if (result.success) {
        if (result.paymentResult?.success) {
          toast.success('🎉 Payment triggered! Check Etherscan for transaction');
        } else if (result.metricsReached) {
          toast.success('Metrics reached but payment already made!');
        } else {
          toast.success('Metrics updated - need more engagement to trigger payment');
        }
      } else {
        toast.error(result.error || 'Metrics check failed');
      }
      
    } catch (error: any) {
      console.error('Blai test error:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  // Check metrics for specific submission
  const handleCheckMetrics = async () => {
    if (!submission) return;
    
    setIsChecking(true);
    
    try {
      toast.success('Checking TikTok metrics and processing payment...');
      const result = await apiClient.blockchain.checkMetrics({
        tiktokUrl: submission.tiktokUrl,
        campaignId: submission.campaignId,
        creatorAddress: submission.creatorAddress,
        requireAiApproval: false // Skip AI for demo
      });
      
      setLastResult(result);
      if (onMetricsUpdate) onMetricsUpdate(result);
      
      if (result.success) {
        if (result.paymentResult?.success) {
          toast.success('🎉 Payment successful! ETH sent to creator wallet');
        } else if (result.metricsReached) {
          toast.success('Metrics reached! Processing payment...');
        } else {
          toast.success('Metrics updated successfully');
        }
      } else {
        toast.error(result.error || 'Metrics check failed');
      }
      
    } catch (error: any) {
      console.error('Metrics check error:', error);
      toast.error(`Check failed: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3">
        {submission ? (
          <button
            onClick={handleCheckMetrics}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isChecking ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            {isChecking ? 'Checking Metrics...' : 'Check Metrics & Pay'}
          </button>
        ) : (
          <button
            onClick={handleBlaiTest}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isChecking ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Target size={16} />
            )}
            {isChecking ? 'Testing...' : 'Test Blai Video Demo'}
          </button>
        )}
      </div>

      {/* Results Display */}
      {lastResult && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Metrics Check Results
          </h4>
          
          {lastResult.success ? (
            <div className="space-y-3">
              {/* Current Metrics */}
              {lastResult.currentMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600">Current Likes:</span>
                    <p className="font-bold text-lg text-blue-600">
                      {lastResult.currentMetrics.likes?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600">Current Views:</span>
                    <p className="font-bold text-lg text-purple-600">
                      {lastResult.currentMetrics.views?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600">Target Likes:</span>
                    <p className="font-bold text-lg text-gray-700">
                      {lastResult.targetMetrics?.likes || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600">Metrics Met:</span>
                    <p className="font-bold text-lg">
                      {lastResult.metricsReached ? (
                        <span className="text-green-600">✅ YES</span>
                      ) : (
                        <span className="text-red-600">❌ NO</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Status */}
              {lastResult.paymentResult && (
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-green-600" />
                    Payment Status
                  </h5>
                  
                  {lastResult.paymentResult.success ? (
                    <div className="space-y-2">
                      <p className="text-green-700 font-medium">✅ Payment Successful!</p>
                      <p className="text-sm text-gray-600">Amount: 0.001 ETH</p>
                      {lastResult.paymentResult.transactionHash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${lastResult.paymentResult.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <ExternalLink size={14} />
                          View on Etherscan
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-red-700 font-medium">❌ Payment Failed</p>
                      <p className="text-sm text-gray-600">{lastResult.paymentResult.error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm space-y-1">
                  <p><strong>Metrics Reached:</strong> {lastResult.metricsReached ? '✅' : '❌'}</p>
                  <p><strong>AI Approved:</strong> {lastResult.aiApproved ? '✅' : '❌'}</p>
                  <p><strong>Should Pay:</strong> {lastResult.shouldPay ? '✅' : '❌'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">
              <p className="font-medium">❌ Check Failed</p>
              <p className="text-sm">{lastResult.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};