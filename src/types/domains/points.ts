export type TransactionType = 
  | 'EARNED_COLLECTION'
  | 'EARNED_PURCHASE'
  | 'EARNED_REVIEW'
  | 'EARNED_REFERRAL'
  | 'SPENT_DISCOUNT'
  | 'SPENT_PREMIUM'
  | 'EXPIRED'
  | 'ADJUSTMENT';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface PointTransaction {
  transactionId: string;
  userId: string;
  userName: string;
  transactionType: TransactionType;
  pointsAmount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  expiresAt?: string;
  status: TransactionStatus;
  createdAt: string;
  orderId?: string;
  itemId?: string;
  collectionRequestId?: string;
}

export interface PointSummary {
  totalEarnedPoints: number;
  totalSpentPoints: number;
  availablePoints: number;
  expiringPoints: number;
  expiringInDays: number;
  pointsByType: Record<string, number>;
  membershipLevel?: string;
}

export interface PointEarningRequest {
  userId: string;
  transactionType: string;
  pointsAmount: number;
  description?: string;
  orderId?: string;
  itemId?: string;
  collectionRequestId?: string;
}

export interface PointRedemptionRequest {
  userId: string;
  pointsToRedeem: number;
  redemptionType: string;
  description?: string;
  orderId?: string;
}

export interface PointStatistics {
  userId: string;
  totalEarned: number;
  totalSpent: number;
  available: number;
  expiring7Days: number;
  expiring30Days: number;
  pointsByType: Record<string, number>;
}

export interface PointEarningRule {
  ruleId: string;
  ruleName: string;
  description?: string;
  pointsPerPurchase: number;
  pointsPerCollection: number;
  pointsPerReview: number;
  pointsPerReferral: number;
  signupBonus: number;
  dailyLoginPoints: number;
  pointValueInCurrency: number;
  minimumRedemptionPoints: number;
  pointsExpireInDays: number;
  expirationEnabled: boolean;
  eventMultiplier: number;
  eventStartDate?: string;
  eventEndDate?: string;
  isActive: boolean;
  isEventActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PagedTransactions {
  content: PointTransaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}



















