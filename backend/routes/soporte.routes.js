import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { crearTicket, listarTickets } from '../controllers/soporte.controller.js';

const router = Router();

router.post('/tickets', requireAuth, authorize('ADMIN', 'ASISTENTE', 'MEDICO'), crearTicket);
router.get('/tickets', requireAuth, authorize('ADMIN', 'ASISTENTE', 'MEDICO'), listarTickets);

export default router;
