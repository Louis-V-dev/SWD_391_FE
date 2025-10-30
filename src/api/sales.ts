import axiosInstance from '@/lib/axios';

export interface SaleItem {
  id: number;
  saleId: number;
  itemId: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleDetail {
  id: number;
  saleId: number;
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  saleId: number;
  buyerId?: string;
  buyerName?: string;
  buyer?: {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  saleDate: string;
  totalAmount: number;
  details: SaleDetail[];
}

export interface SaleCreateRequest {
  buyerId: string;
  totalAmount: number;
  details: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }>;
}

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  buyerId?: string;
}

const SalesAPI = {
  // Get all sales with pagination
  getAllSales: async (page: number = 0, size: number = 20, filters?: SaleFilters) => {
    const params: any = { page, size, ...filters };
    const response = await axiosInstance.get('/api/sales', { params });
    return response.data;
  },

  // Get sale by ID
  getSaleById: async (id: number): Promise<Sale> => {
    const response = await axiosInstance.get(`/api/sales/${id}`);
    return response.data;
  },

  // Create sale
  createSale: async (data: SaleCreateRequest): Promise<Sale> => {
    const response = await axiosInstance.post('/api/sales', data);
    return response.data;
  },

  // Delete sale
  deleteSale: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/sales/${id}`);
  },

  // Get sales by customer
  getSalesByCustomer: async (customerId: string, page: number = 0, size: number = 20) => {
    const response = await axiosInstance.get(`/api/sales/customer/${customerId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Search sales
  searchSales: async (keyword: string, page: number = 0, size: number = 20) => {
    const response = await axiosInstance.get('/api/sales/search', {
      params: { keyword, page, size }
    });
    return response.data;
  }
};

export default SalesAPI;

