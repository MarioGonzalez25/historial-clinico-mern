// backend/controllers/pacientes.controller.js
import mongoose from 'mongoose';
import Paciente from '../models/Paciente.js';

// --------- Helpers de validación (422) ---------
function validarRequeridosCrear(body = {}) {
  const obligatorios = [
    'nombreCompleto', 'nombrePadre', 'nombreMadre',
    'fechaNacimiento', 'sexo', 'direccion', 'telefono'
  ];
  for (const f of obligatorios) {
    if (body[f] === undefined || body[f] === null || String(body[f]).trim() === '') {
      return `El campo ${f} es obligatorio`;
    }
  }
  // Debe existir al menos DPI o NIT
  if (!body.dpi && !body.nit) {
    return 'Debe proporcionar dpi o nit (al menos uno)';
  }
  return null;
}

function validarParcialesActualizar(body = {}) {
  // Si envían alguno de los obligatorios, no permitir vacío
  const camposNoVacios = [
    'nombreCompleto', 'nombrePadre', 'nombreMadre',
    'fechaNacimiento', 'sexo', 'direccion', 'telefono'
  ];
  for (const f of camposNoVacios) {
    if (f in body && (body[f] === null || String(body[f]).trim() === '')) {
      return `El campo ${f} es obligatorio`;
    }
  }
  // Si tocan DPI/NIT, no permitir que quiten ambos
  if (('dpi' in body || 'nit' in body) && !body.dpi && !body.nit) {
    return 'Debe proporcionar dpi o nit (al menos uno)';
  }
  return null;
}

// --------- Controladores ---------
export const crearPaciente = async (req, res, next) => {
  try {
    const msg = validarRequeridosCrear(req.body);
    if (msg) return res.status(422).json({ error: msg });

    const paciente = await Paciente.create(req.body);
    return res.status(201).json(paciente);
  } catch (err) {
    // Duplicados (dpi/nit) → 409 con campo específico
    if (err?.code === 11000) {
      const field = Object.keys(err?.keyPattern || err?.keyValue || {})[0] || 'documento';
      return res.status(409).json({ error: `Ya existe un paciente con el mismo ${field}` });
    }
    return next(err);
  }
};

export const listarPacientes = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));
    const q = String(req.query.q ?? '').trim();
    const sort = String(req.query.sort ?? '-createdAt');

    // Filtro base
    const filtro = { activo: { $ne: false } };

    // Búsqueda por texto/código
    if (q) {
      filtro.$or = [
        { nombreCompleto: { $regex: q, $options: 'i' } },
        { dpi:           { $regex: q, $options: 'i' } },
        { nit:           { $regex: q, $options: 'i' } },
        { telefono:      { $regex: q, $options: 'i' } },
      ];
    }

    // Sort allowlist
    const allow = new Set(['nombreCompleto', 'dpi', 'nit', 'telefono', 'createdAt', 'updatedAt']);
    const sortObj = {};
    for (const token of sort.split(',')) {
      const key = token.replace(/^-/, '');
      if (allow.has(key)) sortObj[key] = token.startsWith('-') ? -1 : 1;
    }
    if (!Object.keys(sortObj).length) sortObj.createdAt = -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Paciente.find(filtro).sort(sortObj).skip(skip).limit(limit),
      Paciente.countDocuments(filtro),
    ]);

    return res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return next(err);
  }
};

export const detallePaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Identificador inválido' });
    }
    const paciente = await Paciente.findById(id);
    if (!paciente || paciente.activo === false) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    return res.json(paciente);
  } catch (err) {
    return next(err);
  }
};

export const actualizarPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Identificador inválido' });
    }
    if ('_id' in req.body) delete req.body._id;

    const msg = validarParcialesActualizar(req.body);
    if (msg) return res.status(422).json({ error: msg });

    const actualizado = await Paciente.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!actualizado) return res.status(404).json({ error: 'Paciente no encontrado' });
    return res.json(actualizado);
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err?.keyPattern || err?.keyValue || {})[0] || 'documento';
      return res.status(409).json({ error: `Ya existe un paciente con el mismo ${field}` });
    }
    return next(err);
  }
};

export const eliminarPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Identificador inválido' });
    }

    const pac = await Paciente.findByIdAndUpdate(id, { activo: false }, { new: true });
    if (!pac) return res.status(404).json({ error: 'Paciente no encontrado' });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
};
