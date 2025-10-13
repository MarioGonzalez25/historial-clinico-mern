// src/middlewares/rateLimiters.js
import rateLimit from 'express-rate-limit';

// Ventana (por defecto 15 min)
const windowMs = parseInt(process.env.RL_WINDOW_MS || `${15 * 60 * 1000}`, 10);

// Límites (puedes ajustar por .env)
const maxGlobal = parseInt(process.env.RL_GLOBAL_MAX || '300', 10);
const maxLogin  = parseInt(process.env.RL_LOGIN_MAX  || '5',   10);
const maxForgot = parseInt(process.env.RL_FORGOT_MAX || '5',   10);
const maxReset  = parseInt(process.env.RL_RESET_MAX  || '5',   10);

// Constructor de limiters por endpoint sensible
const build = (max, detail) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // funcionará con la IP real si usas trust proxy
  message: { ok: false, error: 'Too many requests', detail }
});

// Rate limit global “suave” (protege toda la API)
export const globalLimiter = rateLimit({
  windowMs,
  max: maxGlobal,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/health'), // no limitar healthcheck
  message: { ok: false, error: 'Rate limit global' }
});

// Limiters específicos
export const loginLimiter  = build(maxLogin,  'Demasiados intentos de inicio de sesión.');
export const forgotLimiter = build(maxForgot, 'Demasiadas solicitudes de recuperación de contraseña.');
export const resetLimiter  = build(maxReset,  'Demasiadas solicitudes de reinicio de contraseña.');
