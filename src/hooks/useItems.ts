import { useState } from 'react';
import { ItemsAPI, CategoriesAPI, BrandsAPI, handleApiError } from '@/api';
import type { 
  Item, 
  CreateItemRequest, 
  UpdateItemRequest, 
  Category, 
  Brand, 
  PaginatedResponse 
} from '@/types';
import { formatApiError } from '@/utils/errorMessages';

interface UseItemsReturn {
  // State
  items: Item[];
  item: Item | null;
  categories: Category[];
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchItems: (params?: any) => Promise<PaginatedResponse<Item>>;
  fetchItem: (id: number) => Promise<Item>;
  createItem: (itemData: CreateItemRequest) => Promise<Item>;
  updateItem: (id: number, itemData: UpdateItemRequest) => Promise<Item>;
  deleteItem: (id: number) => Promise<void>;
  fetchItemsByOwner: (ownerId: number, params?: any) => Promise<PaginatedResponse<Item>>;
  uploadImages: (itemId: number, files: FileList) => Promise<string[]>;
  fetchCategories: () => Promise<Category[]>;
  fetchBrands: () => Promise<Brand[]>;
}

/**
 * Custom hook for items management
 * Provides CRUD operations, state management, and data fetching for items
 */
export const useItems = (): UseItemsReturn => {
  const [items, setItems] = useState<Item[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async (params?: any): Promise<PaginatedResponse<Item>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ItemsAPI.getItems(params);
      setItems(response.data);
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to fetch items.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItem = async (id: number): Promise<Item> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ItemsAPI.getItem(id);
      setItem(response);
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to fetch item details.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createItem = async (itemData: CreateItemRequest): Promise<Item> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ItemsAPI.createItem(itemData);
      setItems(prev => [...prev, response]);
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to create item.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: number, itemData: UpdateItemRequest): Promise<Item> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ItemsAPI.updateItem(id, itemData);
      setItems(prev => prev.map(item => item.itemId === id ? response : item));
      if (item?.itemId === id) {
        setItem(response);
      }
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to update item.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ItemsAPI.deleteItem(id);
      setItems(prev => prev.filter(item => item.itemId !== id));
      if (item?.itemId === id) {
        setItem(null);
      }
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to delete item.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemsByOwner = async (ownerId: number, params?: any): Promise<PaginatedResponse<Item>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ItemsAPI.getItemsByOwner(ownerId, params);
      setItems(response.data);
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to fetch owner items.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async (itemId: number, files: FileList): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ItemsAPI.uploadImages(itemId, files);
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to upload images.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CategoriesAPI.getCategories();
      setCategories(response);
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to fetch categories.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async (): Promise<Brand[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await BrandsAPI.getBrands();
      setBrands(response);
      return response;
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        'Failed to fetch brands.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    items,
    item,
    categories,
    brands,
    isLoading,
    error,
    
    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    fetchItemsByOwner,
    uploadImages,
    fetchCategories,
    fetchBrands,
  };
};
