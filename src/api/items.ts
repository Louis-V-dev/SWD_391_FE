import { apiClient, handleApiError } from '@/lib/axios';
import type { 
  ItemResponse,
  ItemSummaryResponse,
  CreateItemRequest, 
  UpdateItemRequest,
  ItemStatusUpdateRequest,
  ItemStatus,
  Category,
  Brand,
  PaginatedResponse
} from '@/types';

/**
 * Items API Service
 * Comprehensive service for managing circular fashion items
 */
export class ItemsAPI {
  
  // ==================== CRUD Operations ====================
  
  /**
   * Get all items with pagination
   */
  static async getAllItems(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PaginatedResponse<ItemSummaryResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ItemSummaryResponse>>('/api/items', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get item by ID (full details)
   */
  static async getItemById(id: string): Promise<ItemResponse> {
    try {
      const response = await apiClient.get<ItemResponse>(`/api/items/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new item
   */
  static async createItem(itemData: CreateItemRequest, userId: string): Promise<ItemResponse> {
    try {
      const response = await apiClient.post<ItemResponse>(`/api/items?userId=${userId}`, itemData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update item
   */
  static async updateItem(id: string, itemData: UpdateItemRequest): Promise<ItemResponse> {
    try {
      const response = await apiClient.put<ItemResponse>(`/api/items/${id}`, itemData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete item
   */
  static async deleteItem(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/items/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Listing & Filtering ====================

  /**
   * Get items by owner
   */
  static async getItemsByOwner(ownerId: string, params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ItemSummaryResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ItemSummaryResponse>>(
        `/api/items/owner/${ownerId}`, 
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get items by status
   */
  static async getItemsByStatus(status: ItemStatus, params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ItemSummaryResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ItemSummaryResponse>>(
        `/api/items/status/${status}`, 
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get items by category
   */
  static async getItemsByCategory(categoryId: string, params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ItemSummaryResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ItemSummaryResponse>>(
        `/api/items/category/${categoryId}`, 
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get items by brand
   */
  static async getItemsByBrand(brandId: string, params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ItemSummaryResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ItemSummaryResponse>>(
        `/api/items/brand/${brandId}`, 
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search items by keyword
   */
  static async searchItems(keyword: string, params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ItemSummaryResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ItemSummaryResponse>>(
        '/api/items/search', 
        { params: { keyword, ...params } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Filter items with multiple criteria
   */
  static async filterItems(filters: {
    categoryId?: string;
    statuses?: ItemStatus[];
    minCondition?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ItemSummaryResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ItemSummaryResponse>>(
        '/api/items/filter', 
        { params: filters }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Status Management ====================

  /**
   * Update item status
   */
  static async updateItemStatus(
    itemId: string, 
    statusUpdate: ItemStatusUpdateRequest,
    userId: string
  ): Promise<ItemResponse> {
    try {
      const response = await apiClient.patch<ItemResponse>(
        `/api/items/${itemId}/status?userId=${userId}`, 
        statusUpdate
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify item
   */
  static async verifyItem(itemId: string, verifierId: string): Promise<ItemResponse> {
    try {
      const response = await apiClient.post<ItemResponse>(
        `/api/items/${itemId}/verify?verifierId=${verifierId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Image Management ====================

  /**
   * Upload single image to Cloudinary
   */
  static async uploadImage(itemId: string, file: File): Promise<ItemResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ItemResponse>(
        `/api/items/${itemId}/images/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  static async uploadMultipleImages(itemId: string, files: File[]): Promise<ItemResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await apiClient.post<ItemResponse>(
        `/api/items/${itemId}/images/upload-multiple`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add image by URL
   */
  static async addImageByUrl(itemId: string, imageUrl: string): Promise<ItemResponse> {
    try {
      const response = await apiClient.post<ItemResponse>(
        `/api/items/${itemId}/images?imageUrl=${encodeURIComponent(imageUrl)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove image from item
   */
  static async removeImage(itemId: string, imageUrl: string): Promise<ItemResponse> {
    try {
      const response = await apiClient.delete<ItemResponse>(
        `/api/items/${itemId}/images?imageUrl=${encodeURIComponent(imageUrl)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Tags Management ====================

  /**
   * Add tag to item
   */
  static async addTag(itemId: string, tag: string): Promise<ItemResponse> {
    try {
      const response = await apiClient.post<ItemResponse>(
        `/api/items/${itemId}/tags?tag=${encodeURIComponent(tag)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove tag from item
   */
  static async removeTag(itemId: string, tag: string): Promise<ItemResponse> {
    try {
      const response = await apiClient.delete<ItemResponse>(
        `/api/items/${itemId}/tags?tag=${encodeURIComponent(tag)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Statistics ====================

  /**
   * Get item statistics
   */
  static async getStatistics(): Promise<{ averageConditionScore: number }> {
    try {
      const response = await apiClient.get('/api/items/statistics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Count items by owner
   */
  static async countItemsByOwner(ownerId: string): Promise<number> {
    try {
      const response = await apiClient.get<number>(`/api/items/statistics/owner/${ownerId}/count`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Count items by status
   */
  static async countItemsByStatus(status: ItemStatus): Promise<number> {
    try {
      const response = await apiClient.get<number>(`/api/items/statistics/status/${status}/count`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Bulk Operations ====================

  /**
   * Create items in bulk
   */
  static async createBulkItems(requests: CreateItemRequest[], userId: string): Promise<ItemResponse[]> {
    try {
      const response = await apiClient.post<ItemResponse[]>(
        `/api/items/bulk?userId=${userId}`, 
        requests
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete items in bulk
   */
  static async deleteBulkItems(itemIds: string[]): Promise<void> {
    try {
      await apiClient.delete('/api/items/bulk', { data: itemIds });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

/**
 * Categories API Service
 */
export class CategoriesAPI {
  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>('/api/categories');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category by ID
   */
  static async getCategory(id: string): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

/**
 * Brands API Service
 */
export class BrandsAPI {
  /**
   * Get all brands
   */
  static async getBrands(): Promise<Brand[]> {
    try {
      const response = await apiClient.get<Brand[]>('/api/brands');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get brand by ID
   */
  static async getBrand(id: string): Promise<Brand> {
    try {
      const response = await apiClient.get<Brand>(`/api/brands/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
