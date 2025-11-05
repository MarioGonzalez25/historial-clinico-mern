// backend/routes/citas.routes.js
import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Cita from '../models/Cita.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { haySolape } from '../utils/overlap.js';

const router = Router();

const handle = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ errors: e.array() });
  next();
};

// Ping para verificar montaje
router.get('/ping', (_req, res) => res.json({ ok: true, mod: 'citas' }));

/* -------------------- CREAR CITA -------------------- */
router.post('/',
  requireAuth, authorize('MEDICO', 'ASISTENTE', 'ADMIN'),
  body('patientId').isMongoId(),
  body('doctorId').isMongoId(),
  body('inicio').isISO8601().toDate(),
  body('fin').isISO8601().toDate(),
  body('motivo').optional().isString().isLength({ max: 300 }),
  body('notas').optional().isString().isLength({ max: 1000 }),
  body('estado').optional().isIn(['PENDIENTE','CONFIRMADA','ATENDIDA','CANCELADA','NO_ASISTIO']),
  handle,
  async (req, res, next) => {
    try {
      const creador = req.user?.id || req.user?._id || req.user?.uid;
      if (!creador) return res.status(401).json({ error: 'Usuario no identificado' });

      const { patientId, doctorId, inicio, fin, motivo, notas, estado } = req.body;
      const start = new Date(inicio);
      const end   = new Date(fin);
      if (!(start < end)) return res.status(400).json({ error: 'El rango horario es inválido (inicio < fin)' });

      const conflicto = await haySolape(Cita, { patientId, doctorId, inicio: start, fin: end });
      if (conflicto) return res.status(409).json({ error: 'Conflicto: la cita se solapa con otra existente' });

      const cita = await Cita.create({
        patientId, doctorId, inicio: start, fin: end, motivo, notas,
        estado: estado || 'PENDIENTE',
        creadoPor: creador
      });

      res.status(201).json(cita);
    } catch (err) { next(err); }
  }
);

/* -------- LISTAR (filtros + paginación + sort) ------ */
router.get('/',
  requireAuth, authorize('MEDICO','ASISTENTE','ADMIN'),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('doctorId').optional().isMongoId(),
  query('patientId').optional().isMongoId(),
  query('estado').optional().isIn(['PENDIENTE','CONFIRMADA','ATENDIDA','CANCELADA','NO_ASISTIO']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 0 }),
  query('sort').optional().isString(), // ej: inicio:asc | fin:desc
  handle,
  async (req, res, next) => {
    try {
      const { from, to, doctorId, patientId, estado } = req.query;
      const page = Number(req.query.page ?? 1);
      const requestedLimit = req.query.limit === undefined ? undefined : Number(req.query.limit);
      const hasLimit = Number.isFinite(requestedLimit) && requestedLimit > 0;
      const limit = hasLimit ? requestedLimit : 0;
      const [sf, sd = 'asc'] = String(req.query.sort ?? 'inicio:asc').split(':');

      const q = { isDeleted: false };
      if (doctorId && mongoose.isValidObjectId(doctorId)) q.doctorId = doctorId;
      if (patientId && mongoose.isValidObjectId(patientId)) q.patientId = patientId;
      if (estado) q.estado = estado;
      if (from || to) {
        q.inicio = {};
        if (from) q.inicio.$gte = new Date(from);
        if (to)   q.inicio.$lte = new Date(to);
      }

      const skip = hasLimit ? (page - 1) * limit : 0;
      const query = Cita.find(q)
        .sort({ [sf]: sd === 'desc' ? -1 : 1 })
        .populate('patientId','nombreCompleto telefono')
        .populate('doctorId','nombre');
      if (hasLimit) {
        query.skip(skip).limit(limit);
      }

      const [data, total] = await Promise.all([
        query,
        Cita.countDocuments(q)
      ]);

      const responseLimit = hasLimit ? limit : null;
      const responsePage = hasLimit ? page : 1;
      const totalPages = hasLimit && limit > 0 ? Math.ceil(total / limit) : 1;

      res.json({ data, page: responsePage, limit: responseLimit, total, totalPages });
    } catch (err) { next(err); }
  }
);

/* --------------- REPROGRAMAR (PATCH) ---------------- */
router.patch('/:id/reprogramar',
  requireAuth, authorize('MEDICO','ASISTENTE','ADMIN'),
  param('id').isMongoId(),
  body('inicio').isISO8601().toDate(),
  body('fin').isISO8601().toDate(),
  // opcionalmente permitir cambio de doctor/paciente en misma operación
  body('doctorId').optional().isMongoId(),
  body('patientId').optional().isMongoId(),
  handle,
  async (req, res, next) => {
    try {
      const cita = await Cita.findById(req.params.id);
      if (!cita || cita.isDeleted) return res.status(404).json({ error: 'Cita no encontrada' });

      const start = new Date(req.body.inicio);
      const end   = new Date(req.body.fin);
      if (!(start < end)) return res.status(400).json({ error: 'El rango horario es inválido (inicio < fin)' });

      const doctorId  = req.body.doctorId  ?? cita.doctorId;
      const patientId = req.body.patientId ?? cita.patientId;

      const conflicto = await haySolape(Cita, { doctorId, patientId, inicio: start, fin: end, excludeId: cita._id });
      if (conflicto) return res.status(409).json({ error: 'Conflicto: se solapa con otra cita' });

      Object.assign(cita, { inicio: start, fin: end, doctorId, patientId, actualizadoPor: req.user._id });
      await cita.save();
      res.json(cita);
    } catch (err) { next(err); }
  }
);

/* ---------------- CAMBIAR ESTADO (PATCH) ------------ */
router.patch('/:id/estado',
  requireAuth, authorize('MEDICO','ASISTENTE','ADMIN'),
  param('id').isMongoId(),
  body('estado').isIn(['PENDIENTE','CONFIRMADA','ATENDIDA','CANCELADA','NO_ASISTIO']),
  handle,
  async (req, res, next) => {
    try {
      const x = await Cita.findByIdAndUpdate(
        req.params.id,
        { estado: req.body.estado, actualizadoPor: req.user._id },
        { new: true }
      );
      if (!x || x.isDeleted) return res.status(404).json({ error: 'Cita no encontrada' });
      res.json(x);
    } catch (err) { next(err); }
  }
);

/* ------------------- PAPELERA (GET) ----------------- */
router.get('/papelera',
  requireAuth, authorize('MEDICO','ASISTENTE','ADMIN'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isString(), // default deletedAt:desc
  handle,
  async (req, res, next) => {
    try {
      const page  = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);
      const [sf, sd = 'desc'] = String(req.query.sort ?? 'deletedAt:desc').split(':');

      const q = { isDeleted: true };
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        Cita.find(q)
          .sort({ [sf]: sd === 'desc' ? -1 : 1 })
          .skip(skip).limit(limit)
          .populate('patientId','nombreCompleto telefono')
          .populate('doctorId','nombre'),
        Cita.countDocuments(q)
      ]);

      res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
  }
);

/* --------------- ELIMINAR (SOFT-DELETE) ------------- */
router.delete('/:id',
  requireAuth, authorize('MEDICO','ASISTENTE','ADMIN'),
  param('id').isMongoId(),
  handle,
  async (req, res, next) => {
    try {
      const cita = await Cita.findById(req.params.id);
      if (!cita || cita.isDeleted) return res.status(404).json({ error: 'Cita no encontrada' });
      cita.isDeleted = true;
      cita.deletedAt = new Date();
      cita.actualizadoPor = req.user._id;
      await cita.save();
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

export default router;
