// client/src/services/axiosInstance.js
import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// The instance every part of the app uses to talk to the backend.
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // REQUIRED so the httpOnly refresh cookie is sent/received
});

// ── Request interceptor: attach the in-memory access token as a Bearer badge ──
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: on 401, silently refresh ONCE, then retry ──

// One shared refresh: if several requests fail with 401 at the same moment,
// they all wait on a SINGLE refresh call instead of firing many.
let refreshPromise = null;

async function doRefresh() {
  // Use a BARE axios call (not `api`) so this request skips the interceptors
  // above — otherwise a failing refresh would loop forever.
  const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
  const newToken = res.data?.data?.accessToken;
  setAccessToken(newToken);
  return newToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Don't try to refresh the login/refresh calls themselves.
    const isAuthCall =
      original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login');

    if (status === 401 && !original._retry && !isAuthCall) {
      original._retry = true; // mark so we only retry once
      try {
        refreshPromise = refreshPromise || doRefresh(); // share one refresh
        const newToken = await refreshPromise;
        refreshPromise = null;

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original); // retry the original request with the fresh badge
      } catch (refreshErr) {
        refreshPromise = null;
        clearAccessToken();
        // Refresh failed => session is over. Send them to login.
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;