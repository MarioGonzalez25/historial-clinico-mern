import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";
import { HistorialAPI } from "../../api/historial";

const inputBase =
  "block w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100 transition";

export default function RegistrarEvolucion() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    fecha: new Date().toISOString().slice(0, 10),
    motivoConsulta: "",
    diagnostico: "",
    tratamiento: "",
    notas: "",
    presion: "",
    temperatura: "",
    peso: "",
  });

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        const response = await PacientesAPI.list({ limit: 100, sort: "nombreCompleto" });
        setPacientes(response.data || []);
        setForm((prev) => ({
          ...prev,
          patientId: response.data?.[0]?._id || response.data?.[0]?.id || "",
        }));
      } catch (err) {
        console.error("[historial] load pacientes", err);
        const message = err?.response?.data?.error || err?.message || "No se pudieron cargar los pacientes";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  const patientsOptions = useMemo(
    () =>
      pacientes.map((paciente) => ({
        id: paciente._id || paciente.id,
        label: paciente.nombreCompleto,
      })),
    [pacientes]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.patientId) return toast.error("Selecciona un paciente");
    if (!form.fecha) return toast.error("Selecciona la fecha de la evolución");
    if (!form.motivoConsulta.trim()) return toast.error("Ingresa el motivo de consulta");
    if (!form.diagnostico.trim()) return toast.error("Ingresa el diagnóstico principal");
    if (!form.tratamiento.trim()) return toast.error("Ingresa el tratamiento indicado");

    try {
      setSaving(true);
      const payload = {
        patientId: form.patientId,
        fecha: new Date(form.fecha).toISOString(),
        motivoConsulta: form.motivoConsulta,
        diagnostico: form.diagnostico,
        tratamiento: form.tratamiento,
        notas: form.notas,
        signosVitales: {
          presion: form.presion || undefined,
          temperatura: form.temperatura ? Number(form.temperatura) : undefined,
          peso: form.peso ? Number(form.peso) : undefined,
        },
      };
      await HistorialAPI.create(payload);
      toast.success("Evolución registrada correctamente");
      navigate("/historial/consultar");
    } catch (err) {
      console.error("[historial] create", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo registrar la evolución";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5ff] via-[#eef2ff] to-[#fdf2ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-55px_rgba(56,189,248,0.55)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-500/80">Historial clínico</p>
            <h1 className="text-3xl font-semibold text-slate-900">Registrar evolución</h1>
            <p className="text-sm text-slate-500">
              Documenta los hallazgos clínicos de la consulta para mantener actualizado el expediente del paciente.
            </p>
          </header>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-sky-100 bg-sky-50/70 px-5 py-4 text-sm text-sky-600">
              Cargando listado de pacientes…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-10">
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-800">Datos de la consulta</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Paciente
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={onChange}
                      className={`${inputBase} text-slate-700`}
                    >
                      <option value="">Selecciona un paciente</option>
                      {patientsOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Fecha de evolución
                    <input type="date" name="fecha" value={form.fecha} onChange={onChange} className={inputBase} />
                  </label>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-800">Resumen clínico</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                    Motivo de consulta
                    <textarea
                      name="motivoConsulta"
                      value={form.motivoConsulta}
                      onChange={onChange}
                      rows={3}
                      placeholder="Describe el motivo principal de la visita"
                      className={`${inputBase} min-h-[110px] resize-none`}
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Diagnóstico
                    <input
                      type="text"
                      name="diagnostico"
                      value={form.diagnostico}
                      onChange={onChange}
                      placeholder="Diagnóstico principal"
                      className={inputBase}
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Tratamiento indicado
                    <input
                      type="text"
                      name="tratamiento"
                      value={form.tratamiento}
                      onChange={onChange}
                      placeholder="Plan terapéutico"
                      className={inputBase}
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                    Indicaciones y recomendaciones (opcional)
                    <textarea
                      name="notas"
                      value={form.notas}
                      onChange={onChange}
                      rows={3}
                      placeholder="Recomendaciones para el paciente y tutor"
                      className={`${inputBase} min-h-[120px] resize-none`}
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-800">Signos vitales (opcional)</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Presión arterial
                    <input
                      type="text"
                      name="presion"
                      value={form.presion}
                      onChange={onChange}
                      placeholder="Ej. 110/70"
                      className={inputBase}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Temperatura °C
                    <input
                      type="number"
                      step="0.1"
                      name="temperatura"
                      value={form.temperatura}
                      onChange={onChange}
                      placeholder="Ej. 36.5"
                      className={inputBase}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Peso (kg)
                    <input
                      type="number"
                      step="0.1"
                      name="peso"
                      value={form.peso}
                      onChange={onChange}
                      placeholder="Ej. 18.4"
                      className={inputBase}
                    />
                  </label>
                </div>
              </section>

              <div className="flex flex-col gap-3 rounded-2xl bg-sky-50/80 px-5 py-4 text-sm text-sky-700 md:flex-row md:items-center md:justify-between">
                <p className="font-medium">
                  Verifica la información antes de guardar. Podrás editar la evolución desde el historial del paciente.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span aria-hidden>💾</span>
                  {saving ? "Guardando..." : "Guardar evolución"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
