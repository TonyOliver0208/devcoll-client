/**
 * API Client Configuration
 * 
 * Central HTTP client for communicating with microservice backend.
 * Handles authentication, request/response interceptors, and error handling.
 * 
 * @author DevColl Team
 * @version 1.0.0
 */

import axios from 'axios';
import { getSession } from 'next-auth/react';

// Backend microservice URL - configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1';

/**
 * Main API client instance with pre-configured settings
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for microservice calls
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor - Automatically adds authentication headers
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      
      if (session?.user?.id) {
        // Add user identification header for backend user context
        config.headers['X-User-ID'] = session.user.id;
      }
      
      if (session?.accessToken) {
        // Add JWT bearer token for authentication (internal token from auth-service)
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      
      // Add request timestamp for debugging
      config.headers['X-Request-Time'] = new Date().toISOString();
      
    } catch (error) {
      console.warn('API Client: Failed to get session for request:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('API Client: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handles common errors and logging
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response?.status === 401) {
      console.warn('API Client: Unauthorized request - redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('API Client: Forbidden access');
    } else if (error.response?.status === 500) {
      console.error('API Client: Backend server error:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('API Client: Request timeout');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
