import axios from "axios";

/* ─── Axios Instance ──────────────────────────────────────────────────────── */
const useProxy = import.meta.env.DEV;
const api = axios.create({
  baseURL: useProxy ? "" : (import.meta.env.VITE_API_BASE_URL || ""),
  headers: { "Content-Type": "application/json" },
  // increase timeout to allow slow initial model loading on the backend
  timeout: 60000,
});

const API_PREFIX = useProxy ? "/api" : "";

// Debug: log outgoing requests so browser console shows the exact target
api.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL || window.location.origin}${config.url}`;
  // eslint-disable-next-line no-console
  console.debug(`[API] ${config.method?.toUpperCase() || 'REQ'} ${fullUrl}`);
  return config;
});

/* ─── Auto-attach JWT ─────────────────────────────────────────────────────── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── Global error handler ────────────────────────────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // log full error for debugging
    // eslint-disable-next-line no-console
    console.error('[API] response error', err);
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ─── Rumor Detection ─────────────────────────────────────────────────────── */
// POST /predict
// Body:  { text: string }
// Returns: { scheme, level, similarity, verdict, confidence, timestamp }
export const analyzeText = (text) =>
  api.post(`${API_PREFIX}/predict`, { text });

// POST /predict/explain/:history_id
export const getAIExplanation = (historyId) =>
  api.post(`${API_PREFIX}/predict/explain/${historyId}`);

/* ─── Authentication ──────────────────────────────────────────────────────── */
// POST /auth/login    → { access_token, token_type, user }
export const loginUser = (email, password) =>
  api.post(`${API_PREFIX}/auth/login`, { email, password });

// POST /auth/register → { access_token, token_type, user }
export const registerUser = (name, email, password) =>
  api.post(`${API_PREFIX}/auth/register`, { name, email, password });

// POST /auth/logout
export const logoutUser = () =>
  api.post(`${API_PREFIX}/auth/logout`);

// GET /auth/me
export const getCurrentUser = () =>
  api.get(`${API_PREFIX}/auth/me`);

/* ─── History ─────────────────────────────────────────────────────────────── */
// GET  /history              → paginated personal history
export const getHistory = (skip = 0, limit = 20) =>
  api.get(`${API_PREFIX}/history`, { params: { skip, limit } });

// GET  /history/public       → paginated public feed
export const getPublicHistory = (skip = 0, limit = 20) =>
  api.get(`${API_PREFIX}/history/public`, { params: { skip, limit } });

// DELETE /history/:id
export const deleteHistoryItem = (id) =>
  api.delete(`${API_PREFIX}/history/${id}`);

// DELETE /history
export const clearAllHistory = () =>
  api.delete(`${API_PREFIX}/history`);

/* ─── Scheme Details ──────────────────────────────────────────────────────── */
// GET /schemes/search?name=...
export const getSchemeByName = (name) =>
  api.get(`${API_PREFIX}/schemes/search`, { params: { name } });

export default api;
