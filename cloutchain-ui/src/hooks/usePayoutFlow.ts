import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface PayoutResult {
  success: boolean;
  transactionHash?: string;
  amount?: number;
  error?: string;
}

export function usePayoutFlow() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (submissionId: string): Promise<PayoutResult> => {
    if (!submissionId) {
      return { success: false, error: 'No submission ID provided' };
    }

    setIsProcessing(true);

    try {
      const result = await apiClient.submissions.processPayment(submissionId);
      
      toast.success('🎉 Payment processed successfully! Funds secured!', {
        duration: 5000,
      });
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        amount: result.amount
      };
      
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      toast.error(`Payment failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processPayment
  };
}