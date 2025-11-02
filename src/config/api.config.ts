/**
 * API Configuration
 * Centralized configuration for all API endpoints and WebSocket URLs
 * 
 * IMPORTANT: Set NEXT_PUBLIC_API_URL in your deployment environment!
 * - Vercel: Project Settings > Environment Variables
 * - Netlify: Site Settings > Build & Deploy > Environment
 * - Docker: docker-compose.yml or .env file
 */

/**
 * Get the API base URL from environment variables
 * Falls back to localhost ONLY if not set (development fallback)
 * 
 * @throws {Error} In production if NEXT_PUBLIC_API_URL is not set
 */
function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // In production, throw error if API URL is not configured
  if (process.env.NODE_ENV === 'production' && !apiUrl) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL is not set in production!');
    console.error('Please set this environment variable in your deployment platform.');
    throw new Error('API URL is not configured. Please contact system administrator.');
  }
  
  // Development fallback
  if (!apiUrl) {
    console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using localhost (development mode)');
    return 'http://localhost:8080';
  }
  
  return apiUrl;
}

/**
 * Get the WebSocket URL from environment variables
 * Automatically derives from API_URL if not explicitly set
 */
function getWebSocketUrl(): string {
  // Check if explicitly set
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) {
    return wsUrl;
  }
  
  // Derive from API URL
  const apiUrl = getApiUrl();
  return `${apiUrl}/api/ws`;
}

/**
 * API Configuration Object
 * Use these throughout the application instead of hardcoding URLs
 */
export const API_CONFIG = {
  /**
   * Base API URL (e.g., http://localhost:8080 or https://api.yourapp.com)
   */
  BASE_URL: getApiUrl(),
  
  /**
   * WebSocket URL for real-time communications
   */
  WS_URL: getWebSocketUrl(),
  
  /**
   * Request timeout in milliseconds
   */
  TIMEOUT: 30000,
  
  /**
   * Environment flag
   */
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  /**
   * API Endpoints
   */
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY: '/api/auth/verify',
      RESEND_VERIFICATION: '/api/auth/resend-verification',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      ME: '/api/auth/me',
      PROFILE: '/api/auth/profile',
      GOOGLE_LOGIN: '/api/auth/google/login',
      GOOGLE_COMPLETE_PROFILE: '/api/auth/google/complete-profile',
    },
    // Points
    POINTS: {
      AVAILABLE: (userId: string) => `/api/points/${userId}/available`,
      HISTORY: (userId: string) => `/api/points/${userId}/history`,
    },
    // Health Check
    HEALTH: '/actuator/health',
  },
} as const;

/**
 * Helper to build full URL
 */
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Log configuration on app start (development only)
 */
if (typeof window !== 'undefined' && !API_CONFIG.IS_PRODUCTION) {
  console.log('🔧 API Configuration:');
  console.log('  Base URL:', API_CONFIG.BASE_URL);
  console.log('  WebSocket URL:', API_CONFIG.WS_URL);
  console.log('  Environment:', process.env.NODE_ENV);
}

