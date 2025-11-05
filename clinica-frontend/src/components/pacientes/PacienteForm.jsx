import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const inputBase =
  "block w-full rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100/70 transition";

const sexoOptions = [
  { label: "Femenino", value: "FEMENINO" },
  { label: "Masculino", value: "MASCULINO" },
];

const DEFAULT_FORM = {
  nombreCompleto: "",
  nombrePadre: "",
  nombreMadre: "",
  fechaNacimiento: "",
  sexo: "FEMENINO",
  direccion: "",
  telefono: "",
  dpi: "",
  nit: "",
  email: "",
  alergias: "",
  vacunas: "",
  padecimientos: "",
  antecedentes: "",
};

const toCSV = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "string") return value;
  return "";
};

const toList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeInitialForm = (initialValues) => {
  if (!initialValues) return { ...DEFAULT_FORM };
  const asObject = { ...DEFAULT_FORM, ...initialValues };
  const fechaNacimiento = asObject.fechaNacimiento
    ? (() => {
        const date = new Date(asObject.fechaNacimiento);
        return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
      })()
    : "";

  return {
    nombreCompleto: asObject.nombreCompleto || "",
    nombrePadre: asObject.nombrePadre || "",
    nombreMadre: asObject.nombreMadre || "",
    fechaNacimiento,
    sexo: asObject.sexo || "FEMENINO",
    direccion: asObject.direccion || "",
    telefono: asObject.telefono || "",
    dpi: asObject.dpi || "",
    nit: asObject.nit || "",
    email: asObject.email || "",
    alergias: toCSV(asObject.alergias),
    vacunas: toCSV(asObject.vacunas),
    padecimientos: toCSV(asObject.padecimientos),
    antecedentes: asObject.antecedentes || "",
  };
};

export default function PacienteForm({
  initialValues,
  onSubmit,
  submitting = false,
  submitLabel = "Guardar paciente",
  onCancel,
}) {
  const [form, setForm] = useState(() => normalizeInitialForm(initialValues));

  useEffect(() => {
    setForm(normalizeInitialForm(initialValues));
  }, [initialValues]);

  const payloadPreview = useMemo(
    () => ({
      ...form,
      fechaNacimiento: form.fechaNacimiento ? new Date(form.fechaNacimiento).toISOString() : null,
      alergias: toList(form.alergias),
      vacunas: toList(form.vacunas),
      padecimientos: toList(form.padecimientos),
    }),
    [form]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.nombreCompleto.trim()) return "Ingresa el nombre completo";
    if (!form.nombrePadre.trim()) return "Ingresa el nombre del padre o tutor";
    if (!form.nombreMadre.trim()) return "Ingresa el nombre de la madre o tutora";
    if (!form.fechaNacimiento) return "Selecciona la fecha de nacimiento";
    if (!form.telefono.trim()) return "Ingresa el teléfono de contacto";
    if (!form.direccion.trim()) return "Ingresa la dirección del paciente";
    if (!form.dpi.trim() && !form.nit.trim()) return "Debes ingresar DPI o NIT (al menos uno)";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      toast.error(message);
      return;
    }
    try {
      await onSubmit?.({
        ...payloadPreview,
        fechaNacimiento: payloadPreview.fechaNacimiento,
      });
    } catch (err) {
      // El componente padre maneja el error mostrando un toast
      console.error("[PacienteForm] submit", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-10">
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Datos del paciente</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
            Nombre completo
            <input
              type="text"
              name="nombreCompleto"
              value={form.nombreCompleto}
              onChange={onChange}
              placeholder="Ej. Ana María López"
              className={inputBase}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Nombre del padre / tutor
            <input
              type="text"
              name="nombrePadre"
              value={form.nombrePadre}
              onChange={onChange}
              placeholder="Nombre del padre o tutor"
              className={inputBase}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Nombre de la madre / tutora
            <input
              type="text"
              name="nombreMadre"
              value={form.nombreMadre}
              onChange={onChange}
              placeholder="Nombre de la madre o tutora"
              className={inputBase}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Fecha de nacimiento
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={onChange}
              className={inputBase}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Sexo
            <select name="sexo" value={form.sexo} onChange={onChange} className={`${inputBase} text-slate-700`}>
              {sexoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Teléfono de contacto
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={onChange}
              placeholder="Ej. 50212345678"
              className={inputBase}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
            Dirección completa
            <textarea
              name="direccion"
              value={form.direccion}
              onChange={onChange}
              placeholder="Zona, municipio, referencia"
              className={`${inputBase} min-h-[96px] resize-y`}
            />
          </label>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Documentos y contacto</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-600">
            DPI
            <input
              type="text"
              name="dpi"
              value={form.dpi}
              onChange={onChange}
              placeholder="Ej. 1234567890101"
              className={inputBase}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            NIT
            <input
              type="text"
              name="nit"
              value={form.nit}
              onChange={onChange}
              placeholder="Ej. 1234567-8"
              className={inputBase}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
            Correo electrónico
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Ej. contacto@correo.com"
              className={inputBase}
            />
          </label>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Antecedentes clínicos</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Alergias (separadas por coma)
            <textarea
              name="alergias"
              value={form.alergias}
              onChange={onChange}
              placeholder="Ej. Penicilina, mariscos"
              className={`${inputBase} min-h-[90px] resize-y`}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Vacunas al día (separadas por coma)
            <textarea
              name="vacunas"
              value={form.vacunas}
              onChange={onChange}
              placeholder="Ej. Influenza, Hepatitis"
              className={`${inputBase} min-h-[90px] resize-y`}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
            Padecimientos crónicos (separados por coma)
            <textarea
              name="padecimientos"
              value={form.padecimientos}
              onChange={onChange}
              placeholder="Ej. Asma, diabetes infantil"
              className={`${inputBase} min-h-[90px] resize-y`}
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
            Antecedentes importantes
            <textarea
              name="antecedentes"
              value={form.antecedentes}
              onChange={onChange}
              placeholder="Notas relevantes de consultas previas"
              className={`${inputBase} min-h-[120px] resize-y`}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/45 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
