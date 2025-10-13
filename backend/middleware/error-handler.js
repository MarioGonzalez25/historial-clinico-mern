// Middleware para manejar errores en Express y Mongoose
export function errorHandler(err, req, res, _next) {
  console.error('❌ Error:', err?.message || err);

  // 1) Validaciones de Mongoose (required, minlength, custom, etc.)
  if (err?.name === 'ValidationError') {
    const all = Object.values(err.errors || {}).map(e => e.message).filter(Boolean);
    const first = all[0] || 'Datos inválidos';
    return res.status(422).json({ error: first, details: all.length > 1 ? all : undefined });
  }

  // 2) ObjectId inválido
  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Identificador inválido' });
  }

  // 3) Duplicados por índices únicos (dpi/nit, etc.)
  if (err?.code === 11000 || (err?.name === 'MongoServerError' && /E11000/.test(err?.message || ''))) {
    const field = Object.keys(err?.keyPattern || err?.keyValue || {})[0] || 'campo';
    const value = err?.keyValue?.[field];
    return res.status(409).json({
      error: `Ya existe un registro con el mismo ${field}`,
      details: { field, value }
    });
  }

  // 4) Fallback
  console.error(err?.stack || err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
