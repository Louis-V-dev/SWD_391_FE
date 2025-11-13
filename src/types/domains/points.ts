export type TransactionType = 
  | 'EARNED_COLLECTION'
  | 'EARNED_PURCHASE'
  | 'EARNED_REVIEW'
  | 'EARNED_REFERRAL'
  | 'PURCHASED'
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
  pointsByType: Record<string, number>;
}

export interface PagedTransactions {
  content: PointTransaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}



















