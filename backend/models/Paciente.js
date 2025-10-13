import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Reglas Guatemala
const REGEX_DPI = /^\d{13}$/;
const REGEX_NIT = /^(?:\d{1,12}-\d|\d{1,12})$/;
const REGEX_TEL = /^(?:\+?502)?\d{8}$/;

const PacienteSchema = new Schema(
  {
    // === Campos requeridos de la hoja ===
    nombreCompleto: {
      type: String,
      required: [true, 'El campo nombreCompleto es obligatorio'],
      trim: true,
      minlength: [3, 'nombreCompleto debe tener al menos 3 caracteres'],
      maxlength: [120, 'nombreCompleto no debe exceder 120 caracteres'],
    },
    nombrePadre: {
      type: String,
      required: [true, 'El campo nombrePadre es obligatorio'],
      trim: true,
      minlength: [3, 'nombrePadre debe tener al menos 3 caracteres'],
      maxlength: [120, 'nombrePadre no debe exceder 120 caracteres'],
    },
    nombreMadre: {
      type: String,
      required: [true, 'El campo nombreMadre es obligatorio'],
      trim: true,
      minlength: [3, 'nombreMadre debe tener al menos 3 caracteres'],
      maxlength: [120, 'nombreMadre no debe exceder 120 caracteres'],
    },
    fechaNacimiento: {
      type: Date,
      required: [true, 'El campo fechaNacimiento es obligatorio'],
      validate: {
        validator: (v) => v instanceof Date && v <= new Date(),
        message: 'fechaNacimiento no puede ser futura',
      },
    },
    sexo: {
      type: String,
      required: [true, 'El campo sexo es obligatorio'],
      set: (v) => (typeof v === 'string' ? v.toUpperCase().trim() : v),
      validate: {
        validator: (v) => ['MASCULINO', 'FEMENINO'].includes((v || '').toUpperCase().trim()),
        message: 'sexo debe ser MASCULINO o FEMENINO',
      },
    },
    direccion: {
      type: String,
      required: [true, 'El campo direccion es obligatorio'],
      trim: true,
      minlength: [5, 'direccion debe tener al menos 5 caracteres'],
      maxlength: [250, 'direccion no debe exceder 250 caracteres'],
    },

    // Documento: DPI o NIT (al menos uno; únicos si existen)
    dpi: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate: { validator: (v) => !v || REGEX_DPI.test(v), message: 'dpi debe tener 13 dígitos' },
    },
    nit: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate: { validator: (v) => !v || REGEX_NIT.test(v), message: 'nit no tiene un formato válido' },
    },

    telefono: {
      type: String,
      required: [true, 'El campo telefono es obligatorio'],
      trim: true,
      validate: { validator: (v) => REGEX_TEL.test(v), message: 'telefono debe tener 8 dígitos (opcional +502)' },
    },

    // Antecedentes
    alergias: { type: [String], default: [] },
    vacunas: { type: [String], default: [] },
    padecimientos: { type: [String], default: [] },
    hospitalizaciones: { type: [String], default: [] },
    antecedentes: { type: String, trim: true }, // notas libres

    // Extras opcionales
    email: { type: String, trim: true },
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => { ret.id = ret._id; delete ret._id; },
    },
  }
);

// Reglas previas
PacienteSchema.pre('validate', function (next) {
  // Normaliza 'M'/'F'
  if (this.sexo && typeof this.sexo === 'string') {
    const s = this.sexo.toUpperCase().trim();
    if (s === 'M') this.sexo = 'MASCULINO';
    if (s === 'F') this.sexo = 'FEMENINO';
  }
  // Debe existir al menos DPI o NIT
  if (!this.dpi && !this.nit) {
    this.invalidate('dpi', 'Debe proporcionar dpi o nit (al menos uno)');
    this.invalidate('nit', 'Debe proporcionar dpi o nit (al menos uno)');
  }
  next();
});

// Export seguro
export default mongoose.models.Paciente || model('Paciente', PacienteSchema);
