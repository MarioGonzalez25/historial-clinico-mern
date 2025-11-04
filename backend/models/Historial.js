import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const signosVitalesSchema = new Schema(
  {
    presion: { type: String, trim: true }, // "120/80"
    frecuenciaCardiaca: Number,            // bpm
    temperatura: Number,                   // °C
    peso: Number,                          // kg
    altura: Number,                        // m
    saturacionOxigeno: Number,             // %
  },
  { _id: false }
);

const historialSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Paciente', required: true, index: true },
    fecha: { type: Date, required: true, default: Date.now },

    // obligatorio (según tu hoja)
    motivoConsulta: {
      type: String,
      required: [true, 'El campo motivoConsulta es obligatorio'],
      trim: true,
      minlength: [3, 'motivoConsulta debe tener al menos 3 caracteres'],
      maxlength: [500, 'motivoConsulta no debe exceder 500 caracteres'],
    },

    diagnostico: { type: String, required: [true, 'El campo diagnostico es obligatorio'], trim: true },
    tratamiento: { type: String, required: [true, 'El campo tratamiento es obligatorio'], trim: true },
    notas: { type: String, trim: true },
    signosVitales: { type: signosVitalesSchema },

    archivos: [
      {
        nombre: { type: String, trim: true },
        tipo: { type: String },
        tamano: Number,
        dataUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    creadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Soft-delete
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

// Índices útiles
historialSchema.index({ patientId: 1, fecha: -1 });
historialSchema.index({ deletedAt: 1, patientId: 1 });

export default mongoose.models.Historial || model('Historial', historialSchema);
