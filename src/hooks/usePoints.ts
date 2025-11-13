import { useState, useEffect, useCallback } from 'react';
import * as pointsApi from '@/api/points';
import { handleApiError } from '@/api';
import { formatApiError } from '@/utils/errorMessages';
import type { 
  PointSummary, 
  PointTransaction, 
  PointStatistics,
  PointRedemptionRequest,
  PagedTransactions
} from '@/types/domains/points';

export const usePointSummary = (userId?: string) => {
  const [summary, setSummary] = useState<PointSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await pointsApi.getPointSummary(userId);
      setSummary(data);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'points',
        'Failed to fetch point summary.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};

export const usePointTransactions = (userId?: string, page: number = 0, size: number = 10) => {
  const [transactions, setTransactions] = useState<PagedTransactions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await pointsApi.getUserTransactions(userId, page, size);
      setTransactions(data);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'points',
        'Failed to fetch point transactions.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, page, size]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
};

export const useRecentTransactions = (userId?: string, limit: number = 10) => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await pointsApi.getRecentTransactions(userId, limit);
      setTransactions(data);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'points',
        'Failed to fetch recent transactions.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
};

export const usePointStatistics = (userId?: string) => {
  const [statistics, setStatistics] = useState<PointStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await pointsApi.getPointStatistics(userId);
      setStatistics(data);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'points',
        'Failed to fetch point statistics.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
};

export const usePointRedemption = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redeem = async (request: PointRedemptionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const transaction = await pointsApi.redeemPoints(request);
      return transaction;
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'points',
        'Failed to redeem points. Please try again.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const canRedeem = async (points: number) => {
    if (!userId) return false;
    
    try {
      return await pointsApi.canRedeemPoints(userId, points);
    } catch (err: any) {
      return false;
    }
  };

  const hasEnough = async (requiredPoints: number) => {
    if (!userId) return false;
    
    try {
      return await pointsApi.hasEnoughPoints(userId, requiredPoints);
    } catch (err: any) {
      return false;
    }
  };

  return { redeem, canRedeem, hasEnough, loading, error };
};

