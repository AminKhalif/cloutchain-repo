import { Card } from '@/components/ui/card';

interface PaymentStatusCardProps {
  availableBalance: number;
  engagementGoalsMet: boolean;
  aiVerificationPassed: boolean;
  pendingAmount?: number;
}

export function PaymentStatusCard({ 
  availableBalance, 
  engagementGoalsMet, 
  aiVerificationPassed,
  pendingAmount = 0
}: PaymentStatusCardProps) {
  return (
    <Card className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded-3xl border-0 shadow-sm overflow-hidden relative">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
      
      <div className="relative p-8">
        <div className="flex items-start justify-between">
          {/* Main content */}
          <div className="flex-1">
            <p className="text-green-100 text-sm font-medium mb-2">Available Balance</p>
            <h2 className="text-4xl font-bold mb-1">${availableBalance.toFixed(2)}</h2>
            <p className="text-green-200 text-sm mb-6">0.0016 ETH</p>
            
            {/* Pending and total info */}
            <div className="mb-6">
              <p className="text-green-100 text-sm">
                Pending: ${pendingAmount.toFixed(2)} • Total: ${(availableBalance + pendingAmount).toFixed(2)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-green-200 text-xs">⚡</span>
                <p className="text-green-200 text-xs">Instant payouts enabled</p>
              </div>
            </div>

            {/* Action button */}
            <button className="bg-white text-green-600 font-semibold py-3 px-8 rounded-xl hover:bg-green-50 transition-colors shadow-sm">
              Withdraw
            </button>
          </div>

          {/* Icon */}
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}