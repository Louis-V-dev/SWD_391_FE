import { useState, useCallback } from 'react';
import * as paymentApi from '@/api/payment';
import type { 
  BuyPointsRequest,
  MomoPaymentResponse,
  PaymentHistory,
  PaymentStats
} from '@/types/domains/payment';

/**
 * Hook for buying points with MoMo payment
 */
export const useBuyPoints = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<MomoPaymentResponse | null>(null);

  const buyPoints = async (request: BuyPointsRequest): Promise<MomoPaymentResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentApi.buyPointsWithMomo(request);
      setPaymentResponse(response);
      
      if (response.success && response.payUrl) {
        // Store payment ID in sessionStorage for cancellation tracking
        if (response.paymentId) {
          sessionStorage.setItem('lastPaymentId', response.paymentId);
        }
        // Redirect to MoMo payment page
        window.location.href = response.payUrl;
      } else {
        throw new Error(response.errorMessage || 'Failed to generate payment URL');
      }
      
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to initiate payment';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { buyPoints, loading, error, paymentResponse };
};

/**
 * Hook for checking payment status
 */
export const usePaymentStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const status = await paymentApi.checkPaymentStatus(orderId);
      return status;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to check payment status';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { checkStatus, loading, error };
};

/**
 * Hook for payment history
 */
export const usePaymentHistory = (userId?: string) => {
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (startDate?: string, endDate?: string) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getPaymentHistory(userId, startDate, endDate);
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { history, loading, error, fetchHistory };
};

/**
 * Hook for payment statistics
 */
export const usePaymentStats = (userId?: string) => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getTotalSpentStats(userId);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment stats');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { stats, loading, error, fetchStats };
};

/**
 * Hook for handling MoMo payment redirect callback
 */
export const useMomoCallback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCallback = async (params: {
    requestId: string;
    orderId: string;
    resultCode: string;
    message: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await paymentApi.handleMomoRedirect(params);
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to process payment callback';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleCallback, loading, error };
};

