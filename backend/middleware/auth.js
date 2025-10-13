// middlewares/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  // 1) Extraer token del header Authorization: Bearer <token>
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    // 2) Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Soportar ambos formatos: { id: ... } o { uid: ... }
    const userId = decoded.id || decoded.uid;
    if (!userId) return res.status(401).json({ error: 'Token inválido' });

    // 4) Buscar usuario
    //    Traemos passwordChangedAt para invalidar tokens antiguos
    const user = await User.findById(userId).select('email rol passwordChangedAt');
    if (!user) return res.status(401).json({ error: 'Usuario no válido' });

    // 5) Invalidar tokens emitidos antes de un cambio de contraseña
    //    decoded.iat está en segundos; convertimos passwordChangedAt a segundos.
    if (user.passwordChangedAt) {
      const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat && decoded.iat < changedAtSec) {
        return res.status(401).json({ error: 'Token inválido. Inicia sesión nuevamente.' });
      }
    }

    // 6) Inyectar contexto de usuario
    req.user = { id: user._id.toString(), email: user.email, rol: user.rol };
    next();
  } catch (e) {
    // Posibles errores: token expirado, firma inválida, formato incorrecto, etc.
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
