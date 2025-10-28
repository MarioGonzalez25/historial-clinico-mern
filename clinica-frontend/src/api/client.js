import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "token";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Log útil cuando algo falla (CORS/URL)
    console.error("[API ERROR]", err?.response?.status, err?.message, err?.response?.data);
    return Promise.reject(err);
  }
);
