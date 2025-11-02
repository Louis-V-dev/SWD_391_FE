import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AuthAPI } from '@/api';
import { API_CONFIG } from '@/config/api.config';
import type { LoginRequest, RegisterRequest, LoginResponse, UserResponse } from '@/types';

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  username?: string;
  phone?: string;
  role: string;
  sustainabilityScore?: number;
  emailVerified: boolean;
  // Note: sustainabilityPoints removed from User - fetched separately from DB
}

interface UseAuthReturn {
  user: User | null;
  userPoints: number;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<UserResponse>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<string>;
  resetPassword: (email: string) => Promise<string>;
  changePassword: (token: string, newPassword: string) => Promise<string>;
  refreshPoints: () => Promise<void>;
}

/**
 * Custom hook for authentication operations
 * Provides loading states, error handling, and automatic navigation
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user from cookies on mount
  useEffect(() => {
    const userDataStr = Cookies.get('user_data');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
        
        // Fetch points from database (not cookies)
        if (userData.userId) {
          fetchPointsFromDB(userData.userId);
        }
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch points from database
  const fetchPointsFromDB = async (userId: string) => {
    try {
      const { default: axios } = await import('axios');
      const token = Cookies.get('auth_token');
      
      if (!token) return;
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POINTS.AVAILABLE(userId)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const points = response.data.data || response.data || 0;
      setUserPoints(points);
      console.log('✅ Points loaded from DB:', points);
    } catch (err) {
      console.error('Failed to fetch points:', err);
      setUserPoints(0);
    }
  };

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthAPI.login(credentials);
      
      // Store auth data (without points - will be fetched from DB)
      Cookies.set('auth_token', response.accessToken, { expires: 1 }); // 1 day
      const userData = {
        userId: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        fullName: response.firstName && response.lastName ? `${response.firstName} ${response.lastName}` : (response.username || response.email),
        username: response.username || response.email,
        phone: (response as any).phone,
        role: response.role,
        sustainabilityScore: response.sustainabilityScore,
        emailVerified: response.emailVerified
      };
      Cookies.set('user_data', JSON.stringify(userData), { expires: 1 });
      setUser(userData);
      
      // Fetch points from database
      await fetchPointsFromDB(response.userId);
      
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
    setUser(null);
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

  const refreshPoints = async (): Promise<void> => {
    if (!user?.userId) return;
    await fetchPointsFromDB(user.userId);
  };

  return {
    user,
    userPoints,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    resetPassword,
    changePassword,
    refreshPoints,
  };
};
