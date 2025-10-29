import axios, { AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// API base URL - defaults to backend port 8080
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10s to 30s for email operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Changed to Bearer format
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're NOT already on the login/register pages
      // This prevents reload loops when login credentials are wrong
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage = currentPath.includes('/auth/login') || 
                        currentPath.includes('/auth/register') ||
                        currentPath.includes('/auth/forgot-password') ||
                        currentPath.includes('/auth/reset-password');
      
      if (!isAuthPage) {
        // User's token is invalid/expired, redirect to login
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
        window.location.href = '/auth/login';
      }
      // If we're already on an auth page, just reject the error and let the page handle it
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default apiClient;
