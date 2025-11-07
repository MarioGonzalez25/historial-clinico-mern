// frontend/src/api/client.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://historial-clinico-backend-is38u.ondigitalocean.app/api";
const TOKEN_KEY = "token";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true, // Habilita cookies httpOnly si tu backend las usa
});

// Incluir token en headers (si guardas en localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de errores para depurar CORS o rutas
api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("[API ERROR]", err?.response?.status, err?.message, err?.response?.data);
    return Promise.reject(err);
  }
);
