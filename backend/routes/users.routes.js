import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import User from '../models/User.js';
import { emailV, passwordV, validate } from '../middleware/validators.js';

const router = Router();
const ROLES = ['ADMIN', 'MEDICO', 'ASISTENTE'];

const sanitizeUser = (user) => ({
  id: user._id?.toString?.() ?? user.id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

router.get('/', requireAuth, authorize('ADMIN'), async (_req, res, next) => {
  try {
    const users = await User.find({}, 'nombre email rol createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users: users.map(sanitizeUser) });
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

router.post(
  '/',
  requireAuth,
  authorize('ADMIN'),
  [
    body('nombre').exists().withMessage('Nombre es requerido').bail().isString().trim().notEmpty().withMessage('Nombre es requerido'),
    ...emailV,
    ...passwordV,
    body('rol').exists().withMessage('Rol es requerido').bail().isIn(ROLES).withMessage('Rol inválido'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const nombre = req.body.nombre.trim();
      const email = (req.body.email || '').toLowerCase().trim();
      const { password, rol } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });
      }

      const user = await User.create({ nombre, email, password, rol });
      return res.status(201).json({ user: sanitizeUser(user) });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });
      }
      return next(err);
    }
  }
);

router.patch(
  '/:id',
  requireAuth,
  authorize('ADMIN'),
  [
    body('nombre').optional().isString().trim().notEmpty().withMessage('Nombre es requerido'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .bail()
      .normalizeEmail(),
    body('rol').optional().isIn(ROLES).withMessage('Rol inválido'),
    body('password').optional().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (req.body.nombre !== undefined) user.nombre = req.body.nombre.trim();
      if (req.body.email !== undefined) user.email = (req.body.email || '').toLowerCase().trim();
      if (req.body.rol !== undefined) user.rol = req.body.rol;
      if (req.body.password) user.password = req.body.password;

      await user.save();
      return res.json({ user: sanitizeUser(user) });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });
      }
      return next(err);
    }
  }
);

router.delete('/:id', requireAuth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user?.id?.toString() === id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
