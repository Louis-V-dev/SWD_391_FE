import Cookies from 'js-cookie';
import { apiClient, handleApiError } from '@/lib/axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  UserResponse 
} from '@/types/domains/auth';

// API Response wrapper types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

/**
 * Authentication API Service
 * Handles all authentication-related API calls with structured response handling
 */
export class AuthAPI {
  /**
   * User login with structured response handling
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', credentials);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      // Handle structured error responses
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Login failed');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * User registration with structured response handling
   */
  static async register(userData: RegisterRequest): Promise<UserResponse> {
    try {
      const response = await apiClient.post<ApiResponse<UserResponse>>('/api/auth/register', userData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      // Handle structured error responses
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Registration failed');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Email verification with structured response handling
   */
  static async verifyEmail(token: string): Promise<string> {
    try {
      const response = await apiClient.get<ApiResponse<{ message: string }>>(`/api/auth/verify?token=${token}`);
      
      if (response.data.success) {
        return response.data.data.message;
      } else {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Email verification failed');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user (clear local storage)
   */
  static logout(): void {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
  }

  /**
   * Refresh token with structured response handling
   */
  static async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/refresh');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Token refresh failed');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Request password reset with structured response handling
   */
  static async requestPasswordReset(email: string): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        return response.data.data.message;
      } else {
        throw new Error(response.data.message || 'Password reset request failed');
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Password reset request failed');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password with token and structured response handling
   */
  static async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', {
        token,
        newPassword
      });
      
      if (response.data.success) {
        return response.data.data.message;
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Password reset failed');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user profile with structured response handling
   */
  static async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await apiClient.get<ApiResponse<UserResponse>>('/api/auth/me');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get user profile');
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Failed to get user profile');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile with structured response handling
   */
  static async updateProfile(userData: Partial<UserResponse>): Promise<UserResponse> {
    try {
      const response = await apiClient.put<ApiResponse<UserResponse>>('/api/auth/profile', userData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiError;
        throw new Error(errorData.message || 'Profile update failed');
      }
      throw new Error(handleApiError(error));
    }
  }
}
