/**
 * Payment Domain Types
 * Types for payment and MoMo integration
 */

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Request to buy points with MoMo payment
 */
export interface BuyPointsRequest {
  userId: string;
  pointsAmount: number;
  description?: string;
}

/**
 * MoMo Payment Response
 */
export interface MomoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: string;
  message: string;
  resultCode: string;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  signature?: string;
  success: boolean;
  errorMessage?: string;
  paymentId?: string;
}

/**
 * Payment History Item
 */
export interface PaymentHistory {
  paymentId: string;
  transactionId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  description: string;
  pointsPurchased: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Payment Statistics
 */
export interface PaymentStats {
  userId: string;
  totalAmountSpent: number;
  totalPointsPurchased: number;
}

