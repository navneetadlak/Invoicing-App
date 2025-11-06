import axios from "axios";
import { getToken, clearToken } from "../utils/helper";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://alitinvoiceappapi.azurewebsites.net/api",
  timeout: 55000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    if (!config.headers) config.headers = {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // token invalid or expired — clear storage and optionally reload/login
      clearToken();
      // Optionally trigger a redirect here if you want global behavior
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;