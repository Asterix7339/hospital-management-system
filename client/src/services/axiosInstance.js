// src/services/axiosInstance.js
// Central HTTP client for all API calls.
// All requests go through here — JWT is attached automatically.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle expired token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hms_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;