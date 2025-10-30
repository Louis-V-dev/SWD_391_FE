import axiosInstance from '@/lib/axios';

export interface DonatedItem {
  donatedItemId: string;
  donationCode: string;
  customer?: {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  staff: {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  category: {
    categoryId: string;
    name: string;
    slug: string;
  };
  brand?: {
    brandId: string;
    name: string;
  };
  name: string;
  description: string;
  size?: string;
  color?: string;
  originalPrice?: number;
  conditionScore?: number;
  conditionDescription?: string;
  materialComposition?: Record<string, number>;
  estimatedValue?: number;
  processingType?: string;
  processingNotes?: string;
  donationStatus: string;
  pointsAwarded?: number;
  convertedToItemId?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  valuatedAt?: string;
  acceptedAt?: string;
  processedAt?: string;
}

export interface ValuationRequest {
  conditionScore: number;
  materialComposition: Record<string, number>;
  estimatedValue: number;
  processingType: string;
  conditionDescription?: string;
}

export interface DonationCreateRequest {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  name: string;
  description: string;
  categoryId: string;
  brandId?: string;
  size?: string;
  color?: string;
  originalPrice?: number;
  images?: string[];
}

const DonationsAPI = {
  // Get all donations with pagination
  getAllDonations: async (page: number = 0, size: number = 20, status?: string) => {
    const params: any = { page, size };
    if (status) params.status = status;
    
    const response = await axiosInstance.get('/api/donations', { params });
    return response.data;
  },

  // Get donation by ID
  getDonationById: async (id: string): Promise<DonatedItem> => {
    const response = await axiosInstance.get(`/api/donations/${id}`);
    return response.data;
  },

  // Get donation by code
  getDonationByCode: async (code: string): Promise<DonatedItem> => {
    const response = await axiosInstance.get(`/api/donations/code/${code}`);
    return response.data;
  },

  // Get donations by status
  getDonationsByStatus: async (status: string, page: number = 0, size: number = 20) => {
    const response = await axiosInstance.get(`/api/donations/status/${status}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get donations by customer
  getDonationsByCustomer: async (customerId: string, page: number = 0, size: number = 20) => {
    const response = await axiosInstance.get(`/api/donations/customer/${customerId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get donations by staff
  getDonationsByStaff: async (staffId: string, page: number = 0, size: number = 20) => {
    const response = await axiosInstance.get(`/api/donations/staff/${staffId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Create donation
  createDonation: async (data: DonationCreateRequest, staffId: string): Promise<DonatedItem> => {
    const response = await axiosInstance.post(`/api/donations?staffId=${staffId}`, data);
    return response.data;
  },

  // Valuate donation
  valuateDonation: async (id: string, valuation: ValuationRequest, staffId: string): Promise<DonatedItem> => {
    const response = await axiosInstance.post(`/api/donations/${id}/valuate?staffId=${staffId}`, valuation);
    return response.data;
  },

  // Accept donation
  acceptDonation: async (id: string, staffId: string): Promise<DonatedItem> => {
    const response = await axiosInstance.post(`/api/donations/${id}/accept?staffId=${staffId}`);
    return response.data;
  },

  // Mark as processing
  markAsProcessing: async (id: string, notes?: string): Promise<DonatedItem> => {
    const response = await axiosInstance.post(`/api/donations/${id}/process`, { notes });
    return response.data;
  },

  // Mark as ready for sale
  markAsReadyForSale: async (id: string, notes?: string): Promise<DonatedItem> => {
    const response = await axiosInstance.post(`/api/donations/${id}/ready-for-sale`, { notes });
    return response.data;
  },

  // Convert to Item
  convertToItem: async (id: string, staffId: string) => {
    const response = await axiosInstance.post(`/api/donations/${id}/convert-to-item?staffId=${staffId}`);
    return response.data;
  },

  // Convert to Item and Sale (ready for marketplace)
  convertToItemAndSale: async (id: string, staffId: string, sellingPrice?: number) => {
    const params: any = { staffId };
    if (sellingPrice) params.sellingPrice = sellingPrice;
    
    const response = await axiosInstance.post(`/api/donations/${id}/convert-and-list`, null, { params });
    return response.data;
  },

  // Search donations
  searchDonations: async (keyword: string, page: number = 0, size: number = 20) => {
    const response = await axiosInstance.get('/api/donations/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Get statistics
  getDonationStatistics: async () => {
    const response = await axiosInstance.get('/api/donations/statistics');
    return response.data;
  },

  // Get pending valuation items
  getPendingValuationItems: async () => {
    const response = await axiosInstance.get('/api/donations/pending-valuation');
    return response.data;
  },

  // Get ready to award points items
  getReadyToAwardPointsItems: async () => {
    const response = await axiosInstance.get('/api/donations/ready-to-award-points');
    return response.data;
  }
};

export default DonationsAPI;

