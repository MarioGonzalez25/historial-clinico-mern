// backend/models/SupportTicket.js
import mongoose from 'mongoose';
import crypto from 'crypto';

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA'];
const ESTADOS = ['ABIERTO', 'EN_PROCESO', 'RESUELTO'];

const generarFolio = () => `SOP-${Date.now().toString(36).toUpperCase()}-${crypto
  .randomBytes(2)
  .toString('hex')
  .toUpperCase()}`;

const SupportTicketSchema = new mongoose.Schema(
  {
    folio: {
      type: String,
      unique: true,
      default: generarFolio,
    },
    asunto: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    prioridad: {
      type: String,
      enum: PRIORIDADES,
      default: 'MEDIA',
    },
    estado: {
      type: String,
      enum: ESTADOS,
      default: 'ABIERTO',
    },
    solicitante: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      rol: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

SupportTicketSchema.index({ folio: 1 }, { unique: true });
SupportTicketSchema.index({ 'solicitante.id': 1, createdAt: -1 });

export default mongoose.model('SupportTicket', SupportTicketSchema);
