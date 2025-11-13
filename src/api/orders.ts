import { apiClient, handleApiError } from '@/lib/axios';

export interface OrderItemRequest {
  itemId: string;
  quantity: number;
  unitPrice?: number;
  discount?: number;
  tax?: number;
}

export interface OrderCreateRequest {
  buyerId: string;
  items: OrderItemRequest[];
  shippingAddress?: string;
  notes?: string;
}

export interface OrderItemResponse {
  itemId: string;
  itemName: string;
  itemImage?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface OrderResponse {
  orderId: string;
  orderCode: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItemResponse[];
  totalItems: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  pointsUsed: number;
  pointsEarned: number;
  status: string;
  statusDisplayName: string;
  shippingAddress?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  arrivedAt?: string;
  cancelledAt?: string;
  autoCompleteScheduledAt?: string;
  notes?: string;
  adminManaged?: boolean;
  pointsAwarded?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export class OrdersAPI {
  
  /**
   * Create orders from cart (checkout)
   */
  static async checkout(request: OrderCreateRequest): Promise<OrderResponse[]> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse[]>>(
        '/api/orders/checkout', 
        request
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  /**
   * Get order by ID
   */
  static async getOrderById(id: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.get<ApiResponse<OrderResponse>>(`/api/orders/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  /**
   * Get orders by buyer
   */
  static async getOrdersByBuyer(
    buyerId: string, 
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<OrderResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<OrderResponse>>>(
        `/api/orders/buyer/${buyerId}`, 
        { params }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  /**
   * Get orders by seller
   */
  static async getOrdersBySeller(
    sellerId: string, 
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<OrderResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<OrderResponse>>>(
        `/api/orders/seller/${sellerId}`, 
        { params }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async updateStatus(orderId: string, status: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/status`,
        null,
        { params: { status } }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async getAdminManagedOrders(
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<OrderResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<OrderResponse>>>(
        '/api/orders/admin/managed',
        { params }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/cancel`,
        null,
        { params: { reason } }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  /**
   * Mark order as shipped
   */
  static async markAsShipped(orderId: string, trackingNumber: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/ship`,
        null,
        { params: { trackingNumber } }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  /**
   * Mark order as delivered
   */
  static async markAsDelivered(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/deliver`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
  
  static async markAsArrived(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/arrive`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Complete order
   */
  static async completeOrder(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/complete`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async confirmReceipt(orderId: string, buyerId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        `/api/orders/${orderId}/receive`,
        null,
        { params: { buyerId } }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}



