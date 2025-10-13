// backend/models/Cita.js
import mongoose from 'mongoose';

const citaSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true, index: true },
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true, index: true },
  motivo:    { type: String, trim: true },
  inicio:    { type: Date, required: true, index: true },
  fin:       { type: Date, required: true, index: true },
  estado:    { type: String, enum: ['PENDIENTE','CONFIRMADA','ATENDIDA','CANCELADA','NO_ASISTIO'], default: 'PENDIENTE', index: true },
  notas:     { type: String, trim: true },

  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },

  creadoPor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

citaSchema.index({ doctorId: 1, inicio: 1, fin: 1 });
citaSchema.index({ patientId: 1, inicio: 1, fin: 1 });

export default mongoose.model('Cita', citaSchema);
