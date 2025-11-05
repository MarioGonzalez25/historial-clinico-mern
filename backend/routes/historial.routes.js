import { Router } from 'express';
import mongoose from 'mongoose';
import Historial from '../models/Historial.js';
import Paciente from '../models/Paciente.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const ARCHIVO_TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const ARCHIVO_MAX_TAMANO = 2 * 1024 * 1024; // 2MB
const ARCHIVO_MAX_CANTIDAD = 5;

const parseArchivos = (rawArchivos = []) => {
  if (!rawArchivos) return [];
  let archivos = rawArchivos;
  if (typeof rawArchivos === 'string') {
    try {
      archivos = JSON.parse(rawArchivos);
    } catch {
      throw new Error('El formato de los archivos adjuntos es inválido');
    }
  }

  if (!Array.isArray(archivos)) throw new Error('archivos debe ser una lista');
  if (archivos.length > ARCHIVO_MAX_CANTIDAD) throw new Error(`Solo puedes adjuntar hasta ${ARCHIVO_MAX_CANTIDAD} archivos`);

  return archivos.map((archivo) => {
    if (!archivo || typeof archivo !== 'object') {
      throw new Error('Cada archivo adjunto debe incluir nombre, tipo, tamaño y dataUrl');
    }
    const { nombre, tipo, tamano, dataUrl } = archivo;
    if (!nombre || !tipo || typeof tamano !== 'number' || !dataUrl) {
      throw new Error('Cada archivo adjunto debe incluir nombre, tipo, tamaño y dataUrl');
    }
    if (!ARCHIVO_TIPOS_PERMITIDOS.has(tipo)) {
      throw new Error('Formato de archivo no permitido. Usa JPG, PNG, WEBP, GIF o PDF.');
    }
    if (tamano > ARCHIVO_MAX_TAMANO) {
      throw new Error('Cada archivo debe pesar máximo 2MB');
    }
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      throw new Error('El archivo debe enviarse en formato base64 (data URL)');
    }

    let uploadedAt = archivo.uploadedAt ? new Date(archivo.uploadedAt) : new Date();
    if (Number.isNaN(uploadedAt.getTime())) {
      uploadedAt = new Date();
    }

    return {
      nombre: nombre.slice(0, 150),
      tipo,
      tamano,
      dataUrl,
      uploadedAt,
    };
  });
};

const router = Router();

// Crear (ADMIN | MEDICO)
router.post('/', requireAuth, authorize('ADMIN', 'MEDICO'), async (req, res) => {
  try {
    const { patientId, fecha, diagnostico, tratamiento, motivoConsulta, notas, signosVitales } = req.body;

    if (!patientId || !fecha || !diagnostico || !tratamiento || !motivoConsulta) {
      return res.status(400).json({ error: 'patientId, fecha, motivoConsulta, diagnostico y tratamiento son obligatorios' });
    }
    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ error: 'patientId no es un ObjectId válido' });
    }
    const paciente = await Paciente.findById(patientId).select('_id').lean();
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    const fechaISO = fecha ? new Date(fecha) : new Date();
    if (isNaN(fechaISO.getTime())) {
      return res.status(400).json({ error: 'fecha debe ser ISO válida (ej. 2025-09-26T14:30:00Z)' });
    }

    let archivos = [];
    try {
      archivos = parseArchivos(req.body.archivos);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    let parsedSignos = signosVitales;
    if (typeof signosVitales === 'string') {
      try {
        parsedSignos = JSON.parse(signosVitales);
      } catch {
        return res.status(400).json({ error: 'signosVitales debe ser JSON válido' });
      }
    }

    // Anti-doble-click: solo cuenta si NO está borrado
    const yaExiste = await Historial.findOne({
      patientId, fecha: fechaISO, diagnostico, creadoPor: req.user.id, deletedAt: { $exists: false }
    }).lean();
    if (yaExiste) return res.status(409).json({ error: 'Duplicado: misma fecha/diagnóstico para este paciente y médico' });

    const entry = await Historial.create({
      patientId,
      fecha: fechaISO,
      motivoConsulta: motivoConsulta.trim(),
      diagnostico: diagnostico.trim(),
      tratamiento: tratamiento.trim(),
      notas,
      signosVitales: parsedSignos,
      archivos,
      creadoPor: req.user.id
    });

    return res.status(201).json(entry);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Duplicado (índice único): misma fecha/diagnóstico para este paciente y médico' });
    }
    console.error('POST /api/historial error', err);
    return res.status(500).json({ error: 'Error al crear historial' });
  }
});

// Listar SOLO activos, con filtros y paginación básica
router.get('/', requireAuth, async (req, res) => {
  try {
    const { patientId, from, to, page = 1, limit = 50 } = req.query;
    if (!patientId) return res.status(400).json({ error: 'Query patientId es obligatorio' });
    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ error: 'patientId no es un ObjectId válido' });
    }

    const q = {
      patientId,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    };
    if (from || to) {
      q.fecha = {};
      if (from) q.fecha.$gte = new Date(from);
      if (to)   q.fecha.$lte = new Date(to);
    }

    const parsedPage = parseInt(page, 10);
    const pg = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const parsedLimit = parseInt(limit, 10);
    let lim = Number.isNaN(parsedLimit) ? 200 : parsedLimit;
    if (lim > 0) lim = Math.min(200, Math.max(1, lim));
    const skip = lim > 0 ? (pg - 1) * lim : 0;

    const findQuery = Historial.find(q).sort({ fecha: -1, createdAt: -1 });
    if (lim > 0) findQuery.skip(skip).limit(lim);

    const [items, total] = await Promise.all([
      findQuery.lean(),
      Historial.countDocuments(q)
    ]);

    const pages = lim > 0 ? Math.ceil(total / lim) || 1 : 1;

    res.json({ total, page: pg, pages, items });
  } catch (err) {
    console.error('GET /api/historial error', err);
    res.status(500).json({ error: 'Error al listar historial' });
  }
});

// Editar (ADMIN o creador)
router.patch('/:id', requireAuth, authorize('ADMIN', 'MEDICO'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'id no válido' });

    const doc = await Historial.findById(id);
    if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Historial no encontrado' });

    const esAdmin = req.user.rol === 'ADMIN';
    const esCreador = String(doc.creadoPor) === String(req.user.id);
    if (!esAdmin && !esCreador) return res.status(403).json({ error: 'Sin permiso para editar este historial' });

    const permitidos = ['motivoConsulta', 'diagnostico', 'tratamiento', 'notas', 'signosVitales', 'fecha'];
    for (const k of permitidos) {
      if (k in req.body) {
        if (k === 'fecha') {
          const f = new Date(req.body.fecha);
          if (isNaN(f.getTime())) return res.status(400).json({ error: 'fecha debe ser ISO válida' });
          doc.fecha = f;
        } else if (k === 'diagnostico' || k === 'tratamiento' || k === 'motivoConsulta') {
          doc[k] = String(req.body[k]).trim();
        } else {
          doc[k] = req.body[k];
        }
      }
    }

    if ('archivos' in req.body) {
      try {
        doc.archivos = parseArchivos(req.body.archivos);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }
    doc.updatedBy = req.user.id;

    await doc.save(); // si choca con el índice único parcial, lanzará 11000
    res.json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Conflicto: combinación duplicada tras editar' });
    }
    console.error('PATCH /api/historial/:id error', err);
    res.status(500).json({ error: 'Error al editar historial' });
  }
});

// Borrar lógico (papelera) (ADMIN o creador)
router.delete('/:id', requireAuth, authorize('ADMIN', 'MEDICO'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'id no válido' });

    const doc = await Historial.findById(id);
    if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Historial no encontrado' });

    const esAdmin = req.user.rol === 'ADMIN';
    const esCreador = String(doc.creadoPor) === String(req.user.id);
    if (!esAdmin && !esCreador) return res.status(403).json({ error: 'Sin permiso para eliminar este historial' });

    doc.deletedAt = new Date();
    doc.deletedBy = req.user.id;
    await doc.save();

    res.json({ ok: true, id: doc._id, deletedAt: doc.deletedAt });
  } catch (err) {
    console.error('DELETE /api/historial/:id error', err);
    res.status(500).json({ error: 'Error al eliminar historial' });
  }
});

// Restaurar desde papelera (ADMIN o creador)
router.patch('/:id/restaurar', requireAuth, authorize('ADMIN', 'MEDICO'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'id no válido' });

    const doc = await Historial.findById(id);
    if (!doc) return res.status(404).json({ error: 'Historial no encontrado' });
    if (!doc.deletedAt) return res.status(409).json({ error: 'La entrada no está en papelera' });

    const esAdmin = req.user.rol === 'ADMIN';
    const esCreador = String(doc.creadoPor) === String(req.user.id);
    if (!esAdmin && !esCreador) return res.status(403).json({ error: 'Sin permiso para restaurar este historial' });

    doc.deletedAt = undefined;
    doc.deletedBy = undefined;

    await doc.save(); // si hay otra activa igual, lanzará 11000
    res.json({ ok: true, id: doc._id });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Conflicto: ya existe una nota activa con misma fecha/diagnóstico para este paciente y médico' });
    }
    console.error('PATCH /api/historial/:id/restaurar error', err);
    res.status(500).json({ error: 'Error al restaurar historial' });
  }
});

export default router;
