// src/middlewares/security.js
import helmet from 'helmet';
import express from 'express';

export function baseSecurity(app) {
  // Respeta X-Forwarded-* (necesario detrás de Nginx / DigitalOcean)
  const hops = parseInt(process.env.TRUST_PROXY || '0', 10);
  if (hops > 0) app.set('trust proxy', hops);

  // Quita cabecera de tecnología y limita tamaño de JSON
  app.disable('x-powered-by');
  app.use(express.json({ limit: '20kb' }));

  // Cabeceras de seguridad por defecto
  app.use(helmet());
  // Si algún recurso cross-origin te da problema, podrías habilitar:
  // app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
}
