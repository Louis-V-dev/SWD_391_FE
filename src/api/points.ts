import axiosInstance from '@/lib/axios';
import type { 
  PointTransaction, 
  PointSummary, 
  PointEarningRequest, 
  PointRedemptionRequest, 
  PointStatistics,
  PointEarningRule,
  PagedTransactions,
  TransactionType
} from '@/types/domains/points';

// Point Transactions
export const earnPoints = async (data: PointEarningRequest): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/earn', data);
  return response.data.data;
};

export const redeemPoints = async (data: PointRedemptionRequest): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/redeem', data);
  return response.data.data;
};

export const adjustPoints = async (userId: string, points: number, reason: string): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/adjust', null, {
    params: { userId, points, reason }
  });
  return response.data.data;
};

// Point Queries
export const getPointSummary = async (userId: string): Promise<PointSummary> => {
  const response = await axiosInstance.get(`/points/summary/${userId}`);
  return response.data.data;
};

export const getUserTransactions = async (
  userId: string, 
  page: number = 0, 
  size: number = 10
): Promise<PagedTransactions> => {
  const response = await axiosInstance.get(`/points/transactions/${userId}`, {
    params: { page, size }
  });
  return response.data.data;
};

export const getRecentTransactions = async (userId: string, limit: number = 10): Promise<PointTransaction[]> => {
  const response = await axiosInstance.get(`/points/transactions/${userId}/recent`, {
    params: { limit }
  });
  return response.data.data;
};

export const getTransactionsByType = async (
  userId: string, 
  type: TransactionType,
  page: number = 0,
  size: number = 10
): Promise<PagedTransactions> => {
  const response = await axiosInstance.get(`/points/transactions/${userId}/type/${type}`, {
    params: { page, size }
  });
  return response.data.data;
};

export const getTransactionsByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 10
): Promise<PagedTransactions> => {
  const response = await axiosInstance.get(`/points/transactions/${userId}/date-range`, {
    params: { startDate, endDate, page, size }
  });
  return response.data.data;
};

// Point Calculations
export const getAvailablePoints = async (userId: string): Promise<number> => {
  const response = await axiosInstance.get(`/points/${userId}/available`);
  return response.data.data;
};

export const getTotalEarnedPoints = async (userId: string): Promise<number> => {
  const response = await axiosInstance.get(`/points/${userId}/earned`);
  return response.data.data;
};

export const getTotalSpentPoints = async (userId: string): Promise<number> => {
  const response = await axiosInstance.get(`/points/${userId}/spent`);
  return response.data.data;
};

export const getExpiringPoints = async (userId: string, days: number = 30): Promise<number> => {
  const response = await axiosInstance.get(`/points/${userId}/expiring`, {
    params: { days }
  });
  return response.data.data;
};

// Point Expiration
export const expirePoints = async (): Promise<void> => {
  await axiosInstance.post('/points/expire');
};

export const getExpiringSoonPoints = async (userId: string, days: number = 7): Promise<PointTransaction[]> => {
  const response = await axiosInstance.get(`/points/${userId}/expiring-soon`, {
    params: { days }
  });
  return response.data.data;
};

export const notifyExpiringPoints = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/points/${userId}/notify-expiring`);
};

// Point Statistics
export const getPointStatistics = async (userId: string): Promise<PointStatistics> => {
  const response = await axiosInstance.get(`/points/${userId}/statistics`);
  return response.data.data;
};

export const getPointsByType = async (userId: string): Promise<Record<string, number>> => {
  const response = await axiosInstance.get(`/points/${userId}/points-by-type`);
  return response.data.data;
};

// Award Points
export const awardPurchasePoints = async (userId: string, orderId: string, purchaseAmount: number): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/award/purchase', null, {
    params: { userId, orderId, purchaseAmount }
  });
  return response.data.data;
};

export const awardCollectionPoints = async (userId: string, collectionRequestId: string): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/award/collection', null, {
    params: { userId, collectionRequestId }
  });
  return response.data.data;
};

export const awardReviewPoints = async (userId: string, itemId: string): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/award/review', null, {
    params: { userId, itemId }
  });
  return response.data.data;
};

export const awardReferralPoints = async (userId: string, referredUserId: string): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/award/referral', null, {
    params: { userId, referredUserId }
  });
  return response.data.data;
};

export const awardSignupBonus = async (userId: string): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/award/signup', null, {
    params: { userId }
  });
  return response.data.data;
};

export const awardDailyLoginPoints = async (userId: string): Promise<PointTransaction> => {
  const response = await axiosInstance.post('/points/award/daily-login', null, {
    params: { userId }
  });
  return response.data.data;
};

// Point Validation
export const hasEnoughPoints = async (userId: string, requiredPoints: number): Promise<boolean> => {
  const response = await axiosInstance.get(`/points/${userId}/has-enough`, {
    params: { requiredPoints }
  });
  return response.data.data;
};

export const canRedeemPoints = async (userId: string, points: number): Promise<boolean> => {
  const response = await axiosInstance.get(`/points/${userId}/can-redeem`, {
    params: { points }
  });
  return response.data.data;
};

// Point Earning Rules
export const getAllRules = async (): Promise<PointEarningRule[]> => {
  const response = await axiosInstance.get('/point-rules');
  return response.data.data;
};

export const getActiveRule = async (): Promise<PointEarningRule> => {
  const response = await axiosInstance.get('/point-rules/active');
  return response.data.data;
};

export const getRuleById = async (ruleId: string): Promise<PointEarningRule> => {
  const response = await axiosInstance.get(`/point-rules/${ruleId}`);
  return response.data.data;
};

export const createRule = async (rule: Omit<PointEarningRule, 'ruleId' | 'createdAt' | 'updatedAt' | 'isEventActive'>): Promise<PointEarningRule> => {
  const response = await axiosInstance.post('/point-rules', rule);
  return response.data.data;
};

export const updateRule = async (ruleId: string, rule: Partial<PointEarningRule>): Promise<PointEarningRule> => {
  const response = await axiosInstance.put(`/point-rules/${ruleId}`, rule);
  return response.data.data;
};

export const deleteRule = async (ruleId: string): Promise<void> => {
  await axiosInstance.delete(`/point-rules/${ruleId}`);
};

export const activateRule = async (ruleId: string): Promise<void> => {
  await axiosInstance.patch(`/point-rules/${ruleId}/activate`);
};









