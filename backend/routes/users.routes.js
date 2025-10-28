import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import User from '../models/User.js';

const router = Router();

router.get('/', requireAuth, authorize('ADMIN'), async (_req, res, next) => {
  try {
    const users = await User.find({}, 'nombre email rol createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/doctors', requireAuth, authorize('ADMIN', 'ASISTENTE', 'MEDICO'), async (_req, res, next) => {
  try {
    const doctors = await User.find({ rol: 'MEDICO' }, 'nombre email rol createdAt')
      .sort({ nombre: 1 })
      .lean();
    res.json({ doctors });
  } catch (err) {
    next(err);
  }
});

export default router;
