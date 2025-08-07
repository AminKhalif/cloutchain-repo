interface PaymentPanelProps {
  rewardAmount: number;
  aiApproved: boolean;
  metricsReached: boolean;
  onClaimPayment?: () => void;
  isProcessing?: boolean;
}

export function PaymentPanel({ 
  rewardAmount, 
  aiApproved, 
  metricsReached, 
  onClaimPayment,
  isProcessing = false
}: PaymentPanelProps) {
  const canClaim = aiApproved && metricsReached;
  const ethPrice = 2300; // Mock ETH price

  if (!canClaim) {
    return null; // Don't show payment panel until requirements are met
  }

  return (
    <div className="relative mt-8">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl blur-sm bg-gradient-to-r from-green-200 to-emerald-200"></div>
      
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-green-200">
        <div className="text-center">
          {/* Money bag icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">💰</span>
          </div>
          
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Ready to Get Paid!
          </h3>
          <p className="text-gray-600 mb-6">Your content passed all requirements</p>
          
          {/* Payment details */}
          <div className="bg-green-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Reward Amount:</span>
              <span className="font-bold text-xl text-gray-900">{rewardAmount} ETH</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">USD Value:</span>
              <span className="font-medium text-gray-800">~${(rewardAmount * ethPrice).toFixed(2)}</span>
            </div>
          </div>
          
          {/* The main action button */}
          <button 
            onClick={onClaimPayment}
            disabled={isProcessing}
            className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-xl transition-all duration-200 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span>Release the Bag</span>
              </div>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Smart contract handles payment automatically
          </p>
        </div>
      </div>
    </div>
  );
}