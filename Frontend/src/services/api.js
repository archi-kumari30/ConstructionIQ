import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for sending/receiving refresh-token cookies
});

// Stored in memory to prevent XSS theft
let accessToken = '';

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Silent refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthUrl = url.includes('/auth/refresh-token') ||
                      url.includes('/auth/login') ||
                      url.includes('/auth/register');

    // Reject immediately if not 401, or if it's already a retry, or if it's login/register/refresh
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthUrl
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call silent refresh-token endpoint
      const response = await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true });
      const { accessToken: newToken } = response.data.data;
      
      setAccessToken(newToken);
      
      processQueue(null, newToken);
      isRefreshing = false;

      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      
      // Token refresh failed (e.g. refresh token expired) -> Clear local state
      setAccessToken('');
      
      // Dispatch an event to notify the application to redirect to login
      window.dispatchEvent(new Event('auth-expired'));
      
      return Promise.reject(refreshError);
    }
  }
);

export default api;
