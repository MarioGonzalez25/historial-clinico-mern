// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { globalLimiter } from './middleware/rateLimiters.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import pacientesRoutes from './routes/pacientes.routes.js';
import citasRoutes from './routes/citas.routes.js';
import historialRoutes from './routes/historial.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usersRoutes from './routes/users.routes.js';

// Middlewares
import { requireAuth } from './middleware/auth.js';

const app = express();

/* -------- Recomendado para App Platform (Nginx delante) -------- */
app.set('trust proxy', 1);
app.disable('etag');
app.disable('x-powered-by');

/* -------- Seguridad y parseo -------- */
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
});

/* -------- CORS --------
   Define CORS_ORIGINS en el entorno, separado por comas.
   Ejemplo:
   CORS_ORIGINS=https://historial-clinico-backend-xxxxx.ondigitalocean.app, http://localhost:5173
*/
const allowed = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.length ? allowed : true,
    credentials: true,
  })
);

/* -------- Logs -------- */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* -------- Rate limit global -------- */
app.use(globalLimiter);

/* -------- Rate limit específico login -------- */
const isDev = process.env.NODE_ENV === 'development';
const loginLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 10 * 60 * 1000, // 1 min en dev, 10 min en prod
  max: isDev ? 50 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/* -------- Healthcheck -------- */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    msg: 'API Clínica funcionando',
    ip: req.ip,
    viaProxy: app.get('trust proxy') || 0,
  });
});

/* -------- Raíz (opcional) -------- */
app.get('/', (_req, res) => res.json({ ok: true, msg: 'API Clínica funcionando' }));

/* -------- Rutas API (todas bajo /api) -------- */
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);

/* -------- Ejemplo de ruta privada -------- */
app.get('/private/hello', requireAuth, (req, res) => {
  res.json({ msg: `Hola ${req.user.email}` });
});

/* -------- Manejo de errores -------- */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

/* -------- Arranque -------- */
const PORT = process.env.PORT || 8080; // 8080 recomendado por DO

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => {
    console.log(
      `✅ Servidor escuchando en http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`
    );
  });
};

start();
