'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { AuthAPI, handleApiError } from '@/api';
import { API_CONFIG } from '@/config/api.config';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  UserResponse, 
  User 
} from '@/types';

interface AuthContextType {
  user: User | null;
  userPoints: number;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<string>;
  updateUser: (userData: Partial<User>) => void;
  refreshPoints: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch points from database
  const fetchPointsFromDB = async (userId: string) => {
    try {
      const { default: axios } = await import('axios');
      const authToken = Cookies.get('auth_token');
      
      if (!authToken) return;
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POINTS.AVAILABLE(userId)}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      // Use nullish coalescing to properly handle 0 as a valid value
      const points = response.data.data ?? response.data ?? 0;
      setUserPoints(typeof points === 'number' ? points : 0);
      console.log('✅ Points loaded from DB:', points);
    } catch (err) {
      console.error('Failed to fetch points:', err);
      setUserPoints(0);
    }
  };

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = Cookies.get('auth_token');
    const storedUser = Cookies.get('user_data');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        console.log('=== RETRIEVING FROM COOKIES ===');
        console.log('Stored user data:', userData);
        console.log('Role from cookies:', userData.role);
        console.log('===============================');
        
        setToken(storedToken);
        setUser(userData);
        
        // Fetch points from database (not cookies)
        if (userData.userId) {
          fetchPointsFromDB(userData.userId);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    console.log('🔐 AuthContext: Login attempt started');
    
    try {
      // DON'T set isLoading here - let the component handle it
      const response: LoginResponse = await AuthAPI.login(credentials);
      
      console.log('✅ AuthContext: API call successful');
      console.log('=== BACKEND LOGIN RESPONSE ===');
      console.log('Raw response:', response);
      console.log('Role from backend:', response.role);
      console.log('================================');
      
      // Backend returns 'accessToken', not 'token'
      const { accessToken: authToken, tokenType, ...userData } = response;
      const fullToken = `${tokenType} ${authToken}`.trim();
      
      const userDataToStore = {
        userId: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        role: userData.role,
        sustainabilityScore: userData.sustainabilityScore,
        // sustainabilityPoints removed - fetched from DB
        trustScore: 5.0,
        emailVerified: userData.emailVerified,
        phoneVerified: userData.phoneVerified,
        isVerified: userData.emailVerified,
        isActive: true,
        isBanned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: '',
      };
      
      console.log('=== STORING IN COOKIES ===');
      console.log('User data being stored:', userDataToStore);
      console.log('Role being stored:', userDataToStore.role);
      console.log('==========================');
      
      // Store in cookies
      Cookies.set('auth_token', authToken, { expires: 7 });
      Cookies.set('user_data', JSON.stringify(userDataToStore), { expires: 7 });
      
      // Update state
      setToken(fullToken);
      setUser(userDataToStore);
      
      // Fetch points from database
      await fetchPointsFromDB(userData.userId);
      
      console.log('✅ AuthContext: Login completed successfully');
    } catch (error) {
      console.error('❌ AuthContext: Login failed, re-throwing error');
      // Re-throw the error WITHOUT wrapping it
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      await AuthAPI.register(userData);
    } catch (error) {
      console.error('❌ AuthContext: Registration failed, re-throwing error');
      // Re-throw the error WITHOUT wrapping it
      throw error;
    }
  };

  const logout = (): void => {
    console.log('🚪 AuthContext: Logging out');
    
    setUser(null);
    setUserPoints(0);
    setToken(null);
    
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    
    AuthAPI.logout();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

  const verifyEmail = async (verificationToken: string): Promise<string> => {
    try {
      setIsLoading(true);
      const result = await AuthAPI.verifyEmail(verificationToken);
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      Cookies.set('user_data', JSON.stringify(updatedUser), { expires: 7 });
    }
  };

  const refreshPoints = async (): Promise<void> => {
    if (user?.userId) {
      await fetchPointsFromDB(user.userId);
    }
  };

  const value: AuthContextType = {
    user,
    userPoints,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    verifyEmail,
    updateUser,
    refreshPoints,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}