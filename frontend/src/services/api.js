import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('organmatch_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Handle 401 auth errors globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('organmatch_token');
      localStorage.removeItem('organmatch_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
