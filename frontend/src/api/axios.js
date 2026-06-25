import axios from "axios";

// Vite's import.meta.env.PROD is true in a production build (npm run build),
// false during local development (npm run dev) — so this automatically
// points at the live backend once deployed, without needing any manual
// switch or .env file.
const BASE_URL = import.meta.env.PROD
  ? "https://food-ordering-app-production-9a9a.up.railway.app/api"
  : "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, force logout so the UI doesn't hang
// in a broken state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;