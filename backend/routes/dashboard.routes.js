import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Paciente from '../models/Paciente.js';
import Cita from '../models/Cita.js';
import Historial from '../models/Historial.js';
import User from '../models/User.js';

const router = Router();

const startOfDay = (date) => {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  return out;
};

const endOfDay = (date) => {
  const out = startOfDay(date);
  out.setDate(out.getDate() + 1);
  return out;
};

const startOfWeek = (date) => {
  const out = startOfDay(date);
  const day = out.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Lunes como inicio
  out.setDate(out.getDate() + diff);
  return out;
};

const addDays = (date, days) => {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
};

router.get('/overview', requireAuth, async (req, res, next) => {
  try {
    const role = req.user.rol;
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 7);
    const sevenDaysAgo = addDays(now, -7);

    const pacienteFilter = { activo: { $ne: false } };
    const baseCitaFilter = { isDeleted: false };

    const citasHoyFilter = { ...baseCitaFilter, inicio: { $gte: dayStart, $lt: dayEnd } };
    const citasSemanaFilter = { ...baseCitaFilter, inicio: { $gte: weekStart, $lt: weekEnd } };
    const proximasCitasFilter = { ...baseCitaFilter, inicio: { $gte: now } };

    if (role === 'MEDICO') {
      citasHoyFilter.doctorId = req.user.id;
      citasSemanaFilter.doctorId = req.user.id;
      proximasCitasFilter.doctorId = req.user.id;
    }

    const [totalPacientes, nuevosPacientes, agendaHoy, totalCitasHoy, citasPendientesHoy, citasSemana, proximasCitas] =
      await Promise.all([
        Paciente.countDocuments(pacienteFilter),
        Paciente.countDocuments({ ...pacienteFilter, createdAt: { $gte: sevenDaysAgo } }),
        Cita.find(citasHoyFilter)
          .sort({ inicio: 1 })
          .limit(10)
          .populate('patientId', 'nombreCompleto telefono')
          .populate('doctorId', 'nombre rol')
          .lean(),
        Cita.countDocuments(citasHoyFilter),
        Cita.countDocuments({ ...citasHoyFilter, estado: { $in: ['PENDIENTE', 'CONFIRMADA'] } }),
        Cita.countDocuments(citasSemanaFilter),
        Cita.find(proximasCitasFilter)
          .sort({ inicio: 1 })
          .limit(5)
          .populate('patientId', 'nombreCompleto telefono')
          .populate('doctorId', 'nombre rol')
          .lean(),
      ]);

    const historialFilter = {
      deletedAt: { $exists: false },
      fecha: { $gte: weekStart, $lt: weekEnd },
    };

    if (role === 'MEDICO') {
      historialFilter.creadoPor = req.user.id;
    }

    const evolucionesSemana = await Historial.countDocuments(historialFilter);

    let usuariosMeta = null;
    if (role === 'ADMIN') {
      const [usuarios, medicos, asistentes] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ rol: 'MEDICO' }),
        User.countDocuments({ rol: 'ASISTENTE' }),
      ]);
      usuariosMeta = { usuarios, medicos, asistentes };
    }

    res.json({
      role,
      totals: {
        pacientes: totalPacientes,
        nuevosPacientes7d: nuevosPacientes,
        citasHoy: totalCitasHoy,
        citasPendientesHoy,
        citasSemana,
        evolucionesSemana,
        ...(usuariosMeta ? usuariosMeta : {}),
      },
      agendaHoy: agendaHoy.map((cita) => ({
        id: cita._id,
        inicio: cita.inicio,
        fin: cita.fin,
        estado: cita.estado,
        motivo: cita.motivo || '',
        paciente: cita.patientId
          ? {
              id: cita.patientId._id || cita.patientId.id,
              nombre: cita.patientId.nombreCompleto,
              telefono: cita.patientId.telefono,
            }
          : null,
        doctor: cita.doctorId
          ? {
              id: cita.doctorId._id || cita.doctorId.id,
              nombre: cita.doctorId.nombre,
              rol: cita.doctorId.rol,
            }
          : null,
      })),
      proximasCitas: proximasCitas.map((cita) => ({
        id: cita._id,
        inicio: cita.inicio,
        fin: cita.fin,
        estado: cita.estado,
        motivo: cita.motivo || '',
        paciente: cita.patientId
          ? {
              id: cita.patientId._id || cita.patientId.id,
              nombre: cita.patientId.nombreCompleto,
            }
          : null,
        doctor: cita.doctorId
          ? {
              id: cita.doctorId._id || cita.doctorId.id,
              nombre: cita.doctorId.nombre,
            }
          : null,
      })),
      fetchedAt: now,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
