import axiosInstance from '@/lib/axios';
import type {
  BuyPointsRequest,
  MomoPaymentResponse,
  PaymentHistory,
  PaymentStats
} from '@/types/domains/payment';

/**
 * Buy points with MoMo payment
 * Generates a MoMo payment URL
 */
export const buyPointsWithMomo = async (request: BuyPointsRequest): Promise<MomoPaymentResponse> => {
  const response = await axiosInstance.post('/api/payment/momo/buy-points', request);
  return response.data.data;
};

/**
 * Check payment status by order ID
 */
export const checkPaymentStatus = async (orderId: string): Promise<{ status: string; orderId: string }> => {
  const response = await axiosInstance.get(`/api/payment/momo/status/${orderId}`);
  return response.data.data;
};

/**
 * Get payment history for the current user
 */
export const getPaymentHistory = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<PaymentHistory[]> => {
  const response = await axiosInstance.get('/api/payment/history', {
    params: { userId, startDate, endDate }
  });
  return response.data.data;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId: string): Promise<PaymentHistory> => {
  const response = await axiosInstance.get(`/api/payment/${paymentId}`);
  return response.data.data;
};

/**
 * Get total amount spent statistics
 */
export const getTotalSpentStats = async (userId: string): Promise<PaymentStats> => {
  const response = await axiosInstance.get('/api/payment/stats/total-spent', {
    params: { userId }
  });
  return response.data.data;
};

/**
 * Handle MoMo payment redirect (called by frontend after payment)
 */
export const handleMomoRedirect = async (params: {
  requestId: string;
  orderId: string;
  resultCode: string;
  message: string;
}): Promise<string> => {
  const response = await axiosInstance.post('/api/payment/momo/redirect', params);
  return response.data.data;
};

/**
 * Cancel a pending payment
 */
export const cancelPayment = async (paymentId: string): Promise<void> => {
  await axiosInstance.post(`/api/payment/cancel/${paymentId}`);
};

