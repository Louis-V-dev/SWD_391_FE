'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { AuthAPI, handleApiError } from '@/api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  UserResponse, 
  User 
} from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<string>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        sustainabilityPoints: userData.sustainabilityPoints,
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

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    verifyEmail,
    updateUser,
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