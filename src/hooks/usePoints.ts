import { useState, useEffect, useCallback } from 'react';
import * as pointsApi from '@/api/points';
import type { 
  PointSummary, 
  PointTransaction, 
  PointStatistics,
  PointRedemptionRequest,
  PagedTransactions,
  PointEarningRule
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch point summary');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recent transactions');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch point statistics');
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to redeem points';
      setError(errorMsg);
      throw new Error(errorMsg);
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

export const useExpiringPoints = (userId?: string, days: number = 7) => {
  const [expiringPoints, setExpiringPoints] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpiringPoints = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await pointsApi.getExpiringSoonPoints(userId, days);
      setExpiringPoints(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expiring points');
    } finally {
      setLoading(false);
    }
  }, [userId, days]);

  useEffect(() => {
    fetchExpiringPoints();
  }, [fetchExpiringPoints]);

  const notify = async () => {
    if (!userId) return;
    
    try {
      await pointsApi.notifyExpiringPoints(userId);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to send notification');
    }
  };

  return { expiringPoints, loading, error, notify, refetch: fetchExpiringPoints };
};

export const usePointEarningRules = () => {
  const [rules, setRules] = useState<PointEarningRule[]>([]);
  const [activeRule, setActiveRule] = useState<PointEarningRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRules, active] = await Promise.all([
        pointsApi.getAllRules(),
        pointsApi.getActiveRule()
      ]);
      setRules(allRules);
      setActiveRule(active);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const activateRule = async (ruleId: string) => {
    try {
      await pointsApi.activateRule(ruleId);
      await fetchRules();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to activate rule');
    }
  };

  return { rules, activeRule, loading, error, activateRule, refetch: fetchRules };
};

