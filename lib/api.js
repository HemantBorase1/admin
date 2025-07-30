// API utility for optimized data fetching
class ApiClient {
  constructor() {
    this.baseURL = '';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generate cache key
  generateCacheKey(endpoint, params = {}) {
    return `${endpoint}?${JSON.stringify(params)}`;
  }

  // Check if cache is valid
  isCacheValid(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Get cached data
  getCachedData(cacheKey) {
    const cached = this.cache.get(cacheKey);
    return cached ? cached.data : null;
  }

  // Set cache data
  setCacheData(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Make API request with error handling and caching
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      useCache = true,
      cacheKey = null,
      ...fetchOptions
    } = options;

    const finalCacheKey = cacheKey || this.generateCacheKey(endpoint, body);

    // Return cached data if available and valid
    if (useCache && method === 'GET' && this.isCacheValid(finalCacheKey)) {
      return this.getCachedData(finalCacheKey);
    }

    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET requests
      if (useCache && method === 'GET') {
        this.setCacheData(finalCacheKey, data);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // CRUD operations
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Batch requests
  async batch(requests) {
    const promises = requests.map(({ endpoint, options = {} }) => 
      this.request(endpoint, options)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        endpoint: requests[index].endpoint,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Specific API methods for the application
export const api = {
  // Farmers
  getFarmers: () => apiClient.get('/api/farmers'),
  createFarmer: (data) => apiClient.post('/api/farmers', data),
  updateFarmer: (id, data) => apiClient.put('/api/farmers', { id, ...data }),
  deleteFarmer: (id) => apiClient.delete('/api/farmers', { body: { id } }),

  // Vendors
  getVendors: () => apiClient.get('/api/vendors'),
  createVendor: (data) => apiClient.post('/api/vendors', data),
  updateVendor: (id, data) => apiClient.put('/api/vendors', { id, ...data }),
  deleteVendor: (id) => apiClient.delete('/api/vendors', { body: { id } }),

  // Products
  getProducts: () => apiClient.get('/api/organic-products'),
  createProduct: (data) => apiClient.post('/api/organic-products', data),
  updateProduct: (id, data) => apiClient.put('/api/organic-products', { id, ...data }),
  deleteProduct: (id) => apiClient.delete('/api/organic-products', { body: { id } }),

  // News
  getNews: () => apiClient.get('/api/news'),
  createNews: (data) => apiClient.post('/api/news', data),
  updateNews: (id, data) => apiClient.put('/api/news', { id, ...data }),
  deleteNews: (id) => apiClient.delete('/api/news', { body: { id } }),

  // Banners
  getBanners: () => apiClient.get('/api/banners'),
  createBanner: (data) => apiClient.post('/api/banners', data),
  updateBanner: (id, data) => apiClient.put('/api/banners', { id, ...data }),
  deleteBanner: (id) => apiClient.delete('/api/banners', { body: { id } }),

  // Auth
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  validateSession: () => apiClient.get('/api/auth/validate'),

  // Dashboard data
  getDashboardData: () => apiClient.batch([
    { endpoint: '/api/farmers' },
    { endpoint: '/api/vendors' },
    { endpoint: '/api/organic-products' },
    { endpoint: '/api/news' }
  ]),

  // Utility methods
  clearCache: () => apiClient.clearCache(),
  getCacheStats: () => ({
    size: apiClient.cache.size,
    keys: Array.from(apiClient.cache.keys())
  })
};

import { useState, useCallback } from 'react';

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiMethod, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiMethod(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    callApi,
    clearError: () => setError(null)
  };
};

export default api; 