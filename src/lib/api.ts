// ═══════════════════════════════════════════════════════════
//  API Client — Axios instance with auth interceptor
// ═══════════════════════════════════════════════════════════

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT token from localStorage on every request ──
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('flowx_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Handle 401 globally — clear token and redirect ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('flowx_token');
      localStorage.removeItem('flowx_user');
    }
    return Promise.reject(error);
  }
);

export default api;
