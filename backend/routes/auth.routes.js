// backend/routes/auth.routes.js
import { Router } from 'express';

// Auth guards
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

// ✅ Rate limiting (por endpoint)
import {
  loginLimiter,
  forgotLimiter,
  resetLimiter
} from '../middleware/rateLimiters.js';

// ✅ Validaciones (express-validator) + agregador de errores 422
import {
  emailV,
  passwordV,
  tokenV,
  newPasswordV,
  currentPasswordV,
  validate
} from '../middleware/validators.js';

// Controladores
import {
  login,
  register,
  me,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/auth.controller.js';

const router = Router();

/* ---------- Rutas Auth con orden correcto ----------
   1) rate limiter
   2) validadores de campos
   3) validate (responde 422 si hay errores)
   4) controlador
----------------------------------------------------- */

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [...emailV, ...passwordV],
  validate,
  login
);

// POST /api/auth/register (solo ADMIN)
router.post(
  '/register',
  requireAuth,
  authorize('ADMIN'),
  [...emailV, ...passwordV],
  validate,
  register
);

// GET /api/auth/me
router.get('/me', requireAuth, me);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  forgotLimiter,
  emailV,
  validate,
  forgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  resetLimiter,
  [...tokenV, ...newPasswordV],
  validate,
  resetPassword
);

// PATCH /api/auth/change-password
router.patch(
  '/change-password',
  requireAuth,
  [...currentPasswordV, ...newPasswordV],
  validate,
  changePassword
);

export default router;
