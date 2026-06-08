import axios from 'axios';
import type { store as reduxStore } from '../store/store';

let store: typeof reduxStore;

/**
 * Injects the Redux store dynamically to avoid circular dependencies
 * while allowing the interceptor to dispatch actions.
 */
export const injectStore = (_store: typeof reduxStore) => {
  store = _store;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attaches JWT Bearer token to every outgoing request if available.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined') {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// Intercepts 401 responses to handle expired/invalid tokens gracefully.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      if (store) {
        store.dispatch({ type: 'auth/logout' });
      } else {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
