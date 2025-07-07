import axios from 'axios';

/**
 * Production-grade Axios HTTP client configuration
 * Handles authentication, error management, request/response transformation,
 * and provides consistent API communication patterns
 */

// Environment configuration with validation
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api' // Use relative URL in development to leverage Next.js proxy
  : process.env.NEXT_PUBLIC_API_URL || 'https://api.thegpdn.org/api';
const REQUEST_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT) || 30000; // 30 seconds
const MAX_RETRIES = parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES) || 3;

// Validate base URL format
if (process.env.NODE_ENV !== 'development' && !BASE_URL.match(/^https?:\/\/.+/)) {
  throw new Error('Invalid API base URL format');
}

// Log configuration in development only
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT,
    maxRetries: MAX_RETRIES
  });
}

/**
 * Custom error class for API-specific errors
 */
class ApiError extends Error {
  constructor(message, status, code, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Token management utilities
 */
const TokenManager = {
  /**
   * Safely get token from localStorage
   * @returns {string|null} Token or null if not available
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  },

  /**
   * Safely remove token from localStorage
   */
  removeToken() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.warn('Failed to remove token from localStorage:', error);
    }
  },

  /**
   * Check if token is expired (basic JWT check)
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired
   */
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

/**
 * Create axios instance with production-grade configuration
 */
const Api = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  // Enable credentials for cross-origin requests if needed
  // withCredentials: true,
});

/**
 * Request interceptor for authentication and content type handling
 */
Api.interceptors.request.use(
  (config) => {
    // Handle authentication
    const token = TokenManager.getToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle content type for different data types
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let browser set it with boundary
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }

    // Add request timestamp for debugging
    config.metadata = {
      startTime: Date.now(),
      requestId: Math.random().toString(36).substr(2, 9)
    };

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request ${config.metadata.requestId}]`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: { ...config.headers, Authorization: config.headers.Authorization ? '[REDACTED]' : undefined },
        data: config.data instanceof FormData ? '[FormData]' : config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(new ApiError(
      'Request configuration failed',
      null,
      'REQUEST_CONFIG_ERROR',
      error
    ));
  }
);

/**
 * Response interceptor for error handling and response transformation
 */
Api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config.metadata ? 
      Date.now() - response.config.metadata.startTime : 0;

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response ${response.config.metadata?.requestId}]`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }

    // Validate response structure
    if (response.data && typeof response.data === 'object') {
      // Add metadata to response
      response.data._metadata = {
        status: response.status,
        duration,
        timestamp: new Date().toISOString()
      };
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const duration = originalRequest?.metadata ? 
      Date.now() - originalRequest.metadata.startTime : 0;

    // Handle network errors
    if (!error.response) {
      const networkError = new ApiError(
        'Network connection failed. Please check your internet connection.',
        null,
        'NETWORK_ERROR',
        { originalError: error.message, duration }
      );
      
      console.error('[API Network Error]', networkError);
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || error.message || 'An unexpected error occurred';

    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Unauthorized - remove invalid token
        TokenManager.removeToken();
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        throw new ApiError(
          'Authentication required. Please log in again.',
          401,
          'UNAUTHORIZED',
          data
        );

      case 403:
        throw new ApiError(
          'Access denied. You do not have permission to perform this action.',
          403,
          'FORBIDDEN',
          data
        );

      case 404:
        throw new ApiError(
          'The requested resource was not found.',
          404,
          'NOT_FOUND',
          data
        );

      case 422:
        throw new ApiError(
          'Validation failed. Please check your input.',
          422,
          'VALIDATION_ERROR',
          data
        );

      case 429:
        throw new ApiError(
          'Too many requests. Please try again later.',
          429,
          'RATE_LIMIT_EXCEEDED',
          data
        );

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError(
          'Server error. Please try again later.',
          status,
          'SERVER_ERROR',
          data
        );

      default:
        throw new ApiError(
          errorMessage,
          status,
          'API_ERROR',
          data
        );
    }
  }
);

/**
 * Utility functions for common API operations
 */
export const ApiUtils = {
  /**
   * Check if error is an API error
   * @param {Error} error - Error to check
   * @returns {boolean} True if error is ApiError
   */
  isApiError(error) {
    return error instanceof ApiError;
  },

  /**
   * Extract error message from various error types
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    if (this.isApiError(error)) {
      return error.message;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  },

  /**
   * Create a cancel token for request cancellation
   * @returns {Object} Cancel token and cancel function
   */
  createCancelToken() {
    const source = axios.CancelToken.source();
    return {
      token: source.token,
      cancel: source.cancel
    };
  },

  /**
   * Check if request was cancelled
   * @param {Error} error - Error to check
   * @returns {boolean} True if request was cancelled
   */
  isRequestCancelled(error) {
    return axios.isCancel(error);
  }
};

// Export the configured axios instance as default
export default Api;

// Export ApiError for use in other modules
export { ApiError };