import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";

const inputBase =
  "block w-full rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100/70 transition";

const sexoOptions = [
  { label: "Femenino", value: "FEMENINO" },
  { label: "Masculino", value: "MASCULINO" },
];

export default function NuevoPaciente() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
  });

  const payloadPreview = useMemo(() => {
    const toList = (value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return {
      ...form,
      alergias: toList(form.alergias),
      vacunas: toList(form.vacunas),
      padecimientos: toList(form.padecimientos),
    };
  }, [form]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nombreCompleto.trim()) return toast.error("Ingresa el nombre completo");
    if (!form.nombrePadre.trim()) return toast.error("Ingresa el nombre del padre o tutor");
    if (!form.nombreMadre.trim()) return toast.error("Ingresa el nombre de la madre o tutora");
    if (!form.fechaNacimiento) return toast.error("Selecciona la fecha de nacimiento");
    if (!form.telefono.trim()) return toast.error("Ingresa el teléfono de contacto");
    if (!form.direccion.trim()) return toast.error("Ingresa la dirección del paciente");
    if (!form.dpi.trim() && !form.nit.trim()) {
      return toast.error("Debes ingresar DPI o NIT (al menos uno)");
    }

    try {
      setSaving(true);
      const payload = {
        ...payloadPreview,
        fechaNacimiento: new Date(form.fechaNacimiento).toISOString(),
      };
      await PacientesAPI.create(payload);
      toast.success("Paciente registrado correctamente");
      setForm({
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
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("[pacientes] create", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo registrar el paciente";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5ff] via-[#eef2ff] to-[#fef3ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_25px_80px_-50px_rgba(99,102,241,0.55)] sm:p-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Registro clínico</p>
            <h1 className="text-3xl font-semibold text-slate-900">Registrar nuevo paciente</h1>
            <p className="text-sm text-slate-500">
              Completa la ficha inicial del paciente junto a los datos del tutor responsable. Podrás actualizar la ficha desde el
              panel de pacientes.
            </p>
          </div>

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
                    required
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
                    required
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
                    required
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
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Sexo
                  <select
                    name="sexo"
                    value={form.sexo}
                    onChange={onChange}
                    className={`${inputBase} text-slate-700`}
                  >
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
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Dirección completa
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={onChange}
                    placeholder="Zona, municipio, departamento"
                    className={inputBase}
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  DPI (13 dígitos)
                  <input
                    type="text"
                    name="dpi"
                    value={form.dpi}
                    onChange={onChange}
                    placeholder="0000000000000"
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
                    placeholder="1234567-8"
                    className={inputBase}
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Correo electrónico (opcional)
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="tutor@dominio.com"
                    className={inputBase}
                  />
                </label>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Antecedentes y alergias</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Alergias
                  <input
                    type="text"
                    name="alergias"
                    value={form.alergias}
                    onChange={onChange}
                    placeholder="Ej. Penicilina, mariscos"
                    className={inputBase}
                  />
                  <span className="text-xs font-medium text-slate-400">Separa cada alergia con una coma.</span>
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Esquema de vacunas
                  <input
                    type="text"
                    name="vacunas"
                    value={form.vacunas}
                    onChange={onChange}
                    placeholder="Ej. SRP, Influenza, Covid-19"
                    className={inputBase}
                  />
                  <span className="text-xs font-medium text-slate-400">Separa cada vacuna con una coma.</span>
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Padecimientos o antecedentes importantes
                  <textarea
                    name="padecimientos"
                    value={form.padecimientos}
                    onChange={onChange}
                    rows={3}
                    placeholder="Ej. Asma, intolerancia a la lactosa"
                    className={`${inputBase} min-h-[110px] resize-none`}
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Notas adicionales
                  <textarea
                    name="antecedentes"
                    value={form.antecedentes}
                    onChange={onChange}
                    rows={3}
                    placeholder="Información relevante para el expediente clínico"
                    className={`${inputBase} min-h-[110px] resize-none`}
                  />
                </label>
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-2xl bg-indigo-50/80 px-5 py-4 text-sm text-indigo-700 md:flex-row md:items-center md:justify-between">
              <p className="font-medium">
                Verifica los datos capturados antes de guardar. Podrás actualizar la ficha en cualquier momento desde el panel de
                pacientes.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Guardando..." : "Guardar paciente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
