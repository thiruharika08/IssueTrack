import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry logic — retry on 5xx or network errors, up to 2 retries
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const shouldRetry = (error) => {
  if (!error.response) return true; // network error
  return error.response.status >= 500;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    config.__retryCount = config.__retryCount || 0;

    // Retry on server errors / network issues (not on 4xx)
    if (shouldRetry(error) && config.__retryCount < MAX_RETRIES && config.method === 'get') {
      config.__retryCount += 1;
      const delay = RETRY_DELAY * config.__retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    // 401 → force logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
