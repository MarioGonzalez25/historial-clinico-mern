// models/User.js  (o models/user.model.js)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const { Schema, model } = mongoose;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

const userSchema = new Schema(
  {
    nombre:   { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    rol:      { type: String, enum: ['ADMIN','MEDICO','ASISTENTE'], default: 'ASISTENTE' },

    // === Nuevos campos para recuperación de contraseña ===
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

// Hashear password si fue modificada
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);

  // Marca el cambio para poder invalidar JWT emitidos antes
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Comparar password
userSchema.methods.comparePassword = function(plain){
  return bcrypt.compare(plain, this.password);
};

// Generar token de reseteo (devuelve el "raw" para enviar por correo)
// Se guarda hasheado en la BD
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  this.passwordResetToken = hashedToken;
  const minutes = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '10', 10);
  this.passwordResetExpires = new Date(Date.now() + minutes * 60 * 1000);

  return rawToken; // Este se manda por correo (o se devuelve en JSON en dev)
};

export default model('User', userSchema);
