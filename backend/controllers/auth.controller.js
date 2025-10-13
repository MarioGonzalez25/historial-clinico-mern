// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendResetEmail } from '../utils/sendEmail.js'; // envío de email (SMTP o Ethereal)

const signToken = (user) =>
  jwt.sign(
    { id: user._id, rol: user.rol, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '1d' }
  );

// ========== AUTH BÁSICO ==========
export const login = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const { password } = req.body;

    const u = await User.findOne({ email }).select('+password');
    if (!u) return res.status(400).json({ error: 'Credenciales inválidas' });

    const ok = await u.comparePassword(password);
    if (!ok) return res.status(400).json({ error: 'Credenciales inválidas' });

    const token = signToken(u);
    return res.json({
      token,
      user: { id: u._id, nombre: u.nombre, email: u.email, rol: u.rol },
    });
  } catch (e) {
    console.error('login error:', e);
    return res.status(500).json({ error: 'Error en login' });
  }
};

export const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const u = await User.create({
      nombre,
      email: (email || '').toLowerCase().trim(),
      password,
      rol,
    });
    return res.status(201).json({ id: u._id, email: u.email, rol: u.rol });
  } catch (e) {
    console.error('register error:', e);
    return res
      .status(400)
      .json({ error: 'No se pudo crear usuario', detail: e.message });
  }
};

export const me = (req, res) => {
  return res.json({ ok: true, user: req.user });
};

// ========== RECUPERACIÓN DE CONTRASEÑA ==========
export const forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ message: 'Email es requerido.' });

    const user = await User.findOne({ email });

    // Respuesta uniforme (no revelar si existe o no el correo)
    if (!user) {
      return res.status(200).json({
        message:
          'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.',
      });
    }

    // Generar token (se guarda hasheado + expiración en BD)
    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;

    // Intentar enviar correo; si falla, permitimos continuar (modo dev) con debug
    let emailMeta = null;
    try {
      emailMeta = await sendResetEmail({ to: user.email, resetLink });
    } catch (mailErr) {
      console.error('Error enviando correo (se permite continuar):', mailErr);
      emailMeta = { error: 'send_failed' };
    }

    const payload = {
      message:
        'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.',
    };

    // En desarrollo, expón info útil para pruebas
    if (process.env.NODE_ENV !== 'production') {
      payload.debug = {
        resetToken: rawToken,
        resetLink,
        expiresAt: user.passwordResetExpires,
        emailSend: emailMeta?.error ? 'skipped' : 'sent',
        previewUrl: emailMeta?.previewUrl || null, // si usó Ethereal, abre este link
      };
    }

    return res.status(200).json(payload);
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: 'Token y nueva contraseña son requeridos.' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // Buscar usuario por token hasheado y no expirado
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Token inválido o expirado. Solicita uno nuevo.' });
    }

    // Guardar nueva contraseña (pre('save') hace hash y marca passwordChangedAt)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const tokenJwt = signToken(user);
    return res
      .status(200)
      .json({ message: 'Contraseña actualizada correctamente.', token: tokenJwt });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Contraseña actual y nueva son requeridas.' });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }
    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ message: 'La nueva contraseña no puede ser igual a la anterior.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Contraseña actual incorrecta.' });

    user.password = newPassword;
    await user.save(); // re-hash + set passwordChangedAt

    const tokenJwt = signToken(user);
    return res
      .status(200)
      .json({ message: 'Contraseña cambiada exitosamente.', token: tokenJwt });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
};
