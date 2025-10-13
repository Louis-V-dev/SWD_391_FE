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
  
  // ==================== CRUD Operations ====================
  
  /**
   * Create new category
   */
  static async createCategory(request: any): Promise<any> {
    try {
      const response = await apiClient.post('/api/categories', request);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/categories/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, request: any): Promise<any> {
    try {
      const response = await apiClient.put(`/api/categories/${id}`, request);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete category (soft delete - sets isActive=false and cascades to subcategories)
   */
  static async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/categories/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Hard delete category (permanent deletion)
   */
  static async hardDeleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/categories/${id}/hard`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Restore soft-deleted category
   */
  static async restoreCategory(id: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/categories/${id}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Listing ====================

  /**
   * Get all categories with pagination
   */
  static async getAllCategories(params?: { page?: number; size?: number }): Promise<any> {
    try {
      const response = await apiClient.get('/api/categories', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all active categories
   */
  static async getActiveCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/categories/active');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all inactive (soft-deleted) categories
   */
  static async getInactiveCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/categories/inactive');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get root categories (no parent)
   */
  static async getRootCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/categories/root');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subcategories of a parent
   */
  static async getSubCategories(parentId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/categories/${parentId}/subcategories`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category tree (hierarchical structure)
   */
  static async getCategoryTree(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/categories/tree');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category with all subcategories
   */
  static async getCategoryWithSubCategories(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/categories/${id}/with-subcategories`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search categories
   */
  static async searchCategories(keyword: string, params?: { page?: number; size?: number }): Promise<any> {
    try {
      const response = await apiClient.get('/api/categories/search', { 
        params: { keyword, ...params } 
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category statistics
   */
  static async getStatistics(): Promise<{ totalCategories: number; rootCategories: number; subCategories: number }> {
    try {
      const response = await apiClient.get('/api/categories/statistics');
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
  
  // ==================== CRUD Operations ====================
  
  /**
   * Create new brand
   */
  static async createBrand(request: any): Promise<any> {
    try {
      const response = await apiClient.post('/api/brands', request);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/brands/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get brand by slug
   */
  static async getBrandBySlug(slug: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/brands/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update brand
   */
  static async updateBrand(id: string, request: any): Promise<any> {
    try {
      const response = await apiClient.put(`/api/brands/${id}`, request);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete brand (soft delete - sets isActive=false)
   */
  static async deleteBrand(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/brands/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Hard delete brand (permanent deletion)
   */
  static async hardDeleteBrand(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/brands/${id}/hard`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Restore soft-deleted brand
   */
  static async restoreBrand(id: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/brands/${id}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== Listing ====================

  /**
   * Get all brands with pagination
   */
  static async getAllBrands(params?: { page?: number; size?: number }): Promise<any> {
    try {
      const response = await apiClient.get('/api/brands', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all active brands
   */
  static async getActiveBrands(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/brands/active');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all inactive (soft-deleted) brands
   */
  static async getInactiveBrands(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/brands/inactive');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search brands
   */
  static async searchBrands(keyword: string, params?: { page?: number; size?: number }): Promise<any> {
    try {
      const response = await apiClient.get('/api/brands/search', { 
        params: { keyword, ...params } 
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get verified brands
   */
  static async getVerifiedBrands(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/brands/verified');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get partner brands
   */
  static async getPartnerBrands(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/brands/partners');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get sustainable brands
   */
  static async getSustainableBrands(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/brands/sustainable');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get brand statistics
   */
  static async getStatistics(): Promise<{ totalBrands: number; verifiedBrands: number; partnerBrands: number }> {
    try {
      const response = await apiClient.get('/api/brands/statistics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
