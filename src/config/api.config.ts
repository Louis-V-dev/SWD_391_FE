/**
 * API Configuration
 * Centralized configuration for all API endpoints and WebSocket URLs
 * 
 * IMPORTANT: Set NEXT_PUBLIC_API_URL in your deployment environment!
 */

/**
 * Get the API base URL from environment variables
 * Falls back to localhost ONLY if not set (development fallback)
 * 
 * @throws {Error} In production if NEXT_PUBLIC_API_URL is not set or contains localhost
 */
function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // In production, validate the URL
  if (process.env.NODE_ENV === 'production') {
    if (!apiUrl) {
      console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL is not set in production!');
      console.error('Environment:', process.env.NODE_ENV);
      console.error('Available env keys:', Object.keys(process.env));
      throw new Error('API URL is not configured. Please contact system administrator.');
    }
    
    // Check if URL still contains localhost in production
    if (apiUrl.includes('localhost')) {
      console.error('❌ CRITICAL: NEXT_PUBLIC_API_URL contains localhost in production!');
      console.error('Current value:', apiUrl);
      throw new Error('Production API URL is misconfigured (contains localhost)');
    }
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
  
  // Convert http/https to ws/wss
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const urlWithoutProtocol = apiUrl.replace(/^https?:\/\//, '');
  
  return `${wsProtocol}://${urlWithoutProtocol}/api/ws`;
}

/**
 * API Configuration Object - Using getters for lazy evaluation
 * Use these throughout the application instead of hardcoding URLs
 */
export const API_CONFIG = {
  /**
   * Base API URL (e.g., http://localhost:8080 or https://api.yourapp.com)
   */
  get BASE_URL(): string {
    return getApiUrl();
  },
  
  /**
   * WebSocket URL for real-time communications
   */
  get WS_URL(): string {
    return getWebSocketUrl();
  },
  
  /**
   * Request timeout in milliseconds
   */
  TIMEOUT: 30000,
  
  /**
   * Environment flag
   */
  get IS_PRODUCTION(): boolean {
    return process.env.NODE_ENV === 'production';
  },
  
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
 * Log configuration on app start
 */
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:');
  console.log('  Base URL:', API_CONFIG.BASE_URL);
  console.log('  WebSocket URL:', API_CONFIG.WS_URL);
  console.log('  Environment:', process.env.NODE_ENV);
  console.log('  Raw NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}
