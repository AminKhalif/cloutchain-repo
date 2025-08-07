import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnhancedAvailableBalanceCardProps {
  expectedEthAmount: number;
  canWithdraw: boolean;
  onWithdraw: () => void;
  isProcessing?: boolean;
}

export function EnhancedAvailableBalanceCard({ 
  expectedEthAmount, 
  canWithdraw, 
  onWithdraw,
  isProcessing = false
}: EnhancedAvailableBalanceCardProps) {
  const expectedUsdAmount = expectedEthAmount * 3400; // ETH to USD conversion
  return (
    <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl p-8 text-white shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium opacity-90 mb-2">Expected Earnings</h3>
          <div className="text-4xl font-bold mb-1">
            ${expectedUsdAmount.toFixed(2)}
          </div>
          <div className="text-sm opacity-80">
            {expectedEthAmount.toFixed(5)} ETH
          </div>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Payout Info */}
      <div className="flex items-center justify-center mb-6 text-sm">
        <span className="bg-white/20 px-3 py-2 rounded-full text-xs font-medium">
          ✓ Instant payout enabled
        </span>
      </div>

      {/* Withdraw Button with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onWithdraw}
              disabled={!canWithdraw || isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                canWithdraw && !isProcessing
                  ? 'bg-white text-green-600 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'bg-white/30 text-white/60 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : canWithdraw ? (
                '💰 Secure the Bag'
              ) : (
                '🔒 Complete Requirements'
              )}
            </button>
          </TooltipTrigger>
          {!canWithdraw && !isProcessing && (
            <TooltipContent>
              <p className="text-sm">
                You can only withdraw once the AI agent has verified your content and your campaign has met its engagement targets.
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {!canWithdraw && (
        <p className="text-xs text-center mt-3 opacity-75">
          Complete AI verification and engagement targets to unlock withdrawal
        </p>
      )}
    </div>
  );
}