import axios from "axios";
import { getToken, clearAllAuth } from "../utils/helper";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://alitinvoiceappapi.azurewebsites.net/api",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  timeout: 55000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // debug: show minimal info
  console.debug("[api] request", config.method, config.url, !!token ? "auth" : "no-auth");
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearAllAuth();
      window.dispatchEvent(new CustomEvent("auth:loggedOut"));
    }
    return Promise.reject(err);
  }
);

export default api;
