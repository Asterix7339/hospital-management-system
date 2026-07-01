// client/src/services/authService.js
import api from './axiosInstance';
import { setAccessToken, clearAccessToken } from './tokenStore';

// POST /auth/login -> stores the badge, returns the user
export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  const { accessToken, user } = res.data.data;
  setAccessToken(accessToken);
  return user;
}

// POST /auth/logout -> ends session on server, clears badge locally
export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAccessToken();
  }
}

// GET /auth/me -> current user's profile
export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.data.user;
}

// POST /auth/refresh -> new badge from the refresh cookie, returns the user
export async function refresh() {
  const res = await api.post('/auth/refresh');
  const { accessToken, user } = res.data.data;
  setAccessToken(accessToken);
  return user;
}

// PATCH /auth/change-password
export async function changePassword(currentPassword, newPassword, confirmPassword) {
  await api.patch('/auth/change-password', { currentPassword, newPassword, confirmPassword });
}