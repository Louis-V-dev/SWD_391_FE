import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AuthAPI } from '@/api';
import type { LoginRequest, RegisterRequest, LoginResponse, UserResponse } from '@/types';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<UserResponse>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<string>;
  resetPassword: (email: string) => Promise<string>;
  changePassword: (token: string, newPassword: string) => Promise<string>;
}

/**
 * Custom hook for authentication operations
 * Provides loading states, error handling, and automatic navigation
 */
export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthAPI.login(credentials);
      
      // Store auth data
      Cookies.set('auth_token', response.token, { expires: 1 }); // 1 day
      Cookies.set('user_data', JSON.stringify({
        userId: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        sustainabilityScore: response.sustainabilityScore,
        emailVerified: response.emailVerified
      }), { expires: 1 });
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<UserResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthAPI.register(userData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    AuthAPI.logout();
    router.push('/auth/login');
  };

  const verifyEmail = async (token: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthAPI.verifyEmail(token);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthAPI.requestPasswordReset(email);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (token: string, newPassword: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthAPI.resetPassword(token, newPassword);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    resetPassword,
    changePassword,
  };
};
