// backend/controllers/soporte.controller.js
import SupportTicket from '../models/SupportTicket.js';
import { sendSupportTicketEmail } from '../utils/supportEmail.js';

const PRIORIDADES = new Set(['BAJA', 'MEDIA', 'ALTA']);

const sanitize = (value = '') => String(value ?? '').trim();

export const crearTicket = async (req, res, next) => {
  try {
    const asunto = sanitize(req.body?.asunto);
    const descripcion = sanitize(req.body?.descripcion);
    const prioridad = sanitize(req.body?.prioridad || 'MEDIA').toUpperCase();

    if (!asunto) return res.status(422).json({ error: 'El asunto es obligatorio' });
    if (!descripcion) return res.status(422).json({ error: 'La descripción es obligatoria' });
    if (asunto.length > 140) {
      return res.status(422).json({ error: 'El asunto no puede exceder 140 caracteres' });
    }
    if (descripcion.length > 4000) {
      return res.status(422).json({ error: 'La descripción no puede exceder 4000 caracteres' });
    }
    if (!PRIORIDADES.has(prioridad)) {
      return res.status(422).json({ error: 'Prioridad inválida' });
    }

    const ticket = await SupportTicket.create({
      asunto,
      descripcion,
      prioridad,
      solicitante: {
        id: req.user.id,
        email: req.user.email,
        rol: req.user.rol,
      },
    });

    if (process.env.SUPPORT_EMAIL) {
      try {
        await sendSupportTicketEmail({
          to: process.env.SUPPORT_EMAIL,
          ticket,
        });
      } catch (err) {
        console.error('[support] email notification failed', err);
      }
    }

    return res.status(201).json({
      ticket: {
        id: ticket._id,
        folio: ticket.folio,
        asunto: ticket.asunto,
        descripcion: ticket.descripcion,
        prioridad: ticket.prioridad,
        estado: ticket.estado,
        createdAt: ticket.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const listarTickets = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));

    const filtro = {};
    if (req.user.rol !== 'ADMIN') {
      filtro['solicitante.id'] = req.user.id;
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filtro)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filtro),
    ]);

    return res.json({
      tickets: tickets.map((t) => ({
        id: t._id,
        folio: t.folio,
        asunto: t.asunto,
        descripcion: t.descripcion,
        prioridad: t.prioridad,
        estado: t.estado,
        createdAt: t.createdAt,
        solicitante: t.solicitante,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return next(err);
  }
};
