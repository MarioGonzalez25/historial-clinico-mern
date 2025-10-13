// backend/routes/pacientes.routes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

import {
  listarPacientes,
  detallePaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
} from '../controllers/pacientes.controller.js';

const router = Router();

// Ping para verificar montaje
router.get('/ping', (req, res) => res.json({ ok: true, mod: 'pacientes' }));

// Listar (con q, page, limit, sort)
router.get(
  '/',
  requireAuth,
  authorize('MEDICO', 'ASISTENTE', 'ADMIN'),
  listarPacientes
);

// Detalle por ID
router.get(
  '/:id',
  requireAuth,
  authorize('MEDICO', 'ASISTENTE', 'ADMIN'),
  detallePaciente
);

// Crear
router.post(
  '/',
  requireAuth,
  authorize('MEDICO', 'ASISTENTE', 'ADMIN'),
  crearPaciente
);

// Actualizar
router.put(
  '/:id',
  requireAuth,
  authorize('MEDICO', 'ADMIN'),
  actualizarPaciente
);

// Eliminar (soft: activo=false)
router.delete(
  '/:id',
  requireAuth,
  authorize('MEDICO', 'ADMIN'),
  eliminarPaciente
);

export default router;
