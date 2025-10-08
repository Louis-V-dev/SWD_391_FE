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
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response: LoginResponse = await AuthAPI.login(credentials);
      
      // Store token and user data
      const { token: authToken, tokenType, ...userData } = response;
      const fullToken = `${tokenType} ${authToken}`.trim();
      
      setToken(fullToken);
      setUser({
        userId: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        userType: userData.userType,
        role: userData.role,
        sustainabilityScore: userData.sustainabilityScore,
        sustainabilityPoints: userData.sustainabilityPoints,
        trustScore: 5.0, // Default trust score
        emailVerified: userData.emailVerified,
        phoneVerified: userData.phoneVerified,
        isVerified: userData.emailVerified,
        isActive: true,
        isBanned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: '',
      });

      // Store in cookies
      Cookies.set('auth_token', authToken, { expires: 7 }); // 7 days
      Cookies.set('user_data', JSON.stringify({
        userId: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        userType: userData.userType,
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
      }), { expires: 7 });

    } catch (error) {
      console.error('Login error:', error);
      throw new Error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthAPI.register(userData);
      // Note: After registration, user needs to verify email before logging in
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    AuthAPI.logout();
  };

  const verifyEmail = async (verificationToken: string): Promise<string> => {
    try {
      setIsLoading(true);
      const result = await AuthAPI.verifyEmail(verificationToken);
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update stored user data
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