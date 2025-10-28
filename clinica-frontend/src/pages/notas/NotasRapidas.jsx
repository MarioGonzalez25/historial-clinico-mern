import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";
import { HistorialAPI } from "../../api/historial";

const inputClasses =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100";

const checklist = [
  {
    title: "Signos vitales",
    items: ["Temperatura registrada", "Frecuencia cardiaca", "Saturación de oxígeno"],
  },
  {
    title: "Alertas",
    items: ["Alergias confirmadas", "Medicamentos actuales", "Avisar si requiere ayuno"],
  },
  {
    title: "Logística",
    items: ["Tutor presente", "Consentimiento firmado", "Estudios previos adjuntos"],
  },
];

export default function NotasRapidas() {
  const [pacientes, setPacientes] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    fecha: new Date().toISOString().slice(0, 10),
    titulo: "",
    detalle: "",
  });

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoadingPatients(true);
        const response = await PacientesAPI.list({ limit: 100, sort: "nombreCompleto" });
        setPacientes(response.data || []);
        setForm((prev) => ({
          ...prev,
          patientId: response.data?.[0]?._id || response.data?.[0]?.id || "",
        }));
      } catch (err) {
        console.error("[notas] pacientes", err);
        const message = err?.response?.data?.error || err?.message || "No se pudieron cargar los pacientes";
        toast.error(message);
      } finally {
        setLoadingPatients(false);
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

  const saveNote = async () => {
    if (!form.patientId) return toast.error("Selecciona un paciente");
    if (!form.titulo.trim() && !form.detalle.trim()) return toast.error("Escribe una nota rápida");
    try {
      setSaving(true);
      await HistorialAPI.create({
        patientId: form.patientId,
        fecha: new Date(form.fecha).toISOString(),
        motivoConsulta: form.titulo.trim() || "Nota rápida",
        diagnostico: `Nota rápida - ${form.titulo.trim() || "Seguimiento"}`,
        tratamiento: "N/A",
        notas: form.detalle.trim(),
      });
      toast.success("Nota guardada en el historial del paciente");
      setForm((prev) => ({ ...prev, titulo: "", detalle: "" }));
    } catch (err) {
      console.error("[notas] create", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo guardar la nota";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] via-[#eef2ff] to-[#fef6ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 lg:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-[0_28px_80px_-55px_rgba(99,102,241,0.45)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Preparación de consulta</p>
            <h1 className="text-3xl font-semibold text-slate-900">Notas rápidas</h1>
            <p className="text-sm text-slate-500">
              Revisa tu checklist preconsulta y anota recordatorios importantes antes de recibir al paciente.
            </p>
          </header>

          <section className="mt-8 grid gap-6 md:grid-cols-3">
            {checklist.map((block) => (
              <div
                key={block.title}
                className="rounded-2xl border border-slate-100 bg-indigo-50/60 p-5 shadow-sm shadow-indigo-100"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{block.title}</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-indigo-200 text-indigo-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="mt-10 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <h2 className="text-base font-semibold text-slate-800">Capturar nota rápida</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Paciente
                  {loadingPatients ? (
                    <p className="text-xs text-slate-500">Cargando pacientes…</p>
                  ) : (
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={onChange}
                      className={`${inputClasses} text-slate-700`}
                    >
                      <option value="">Selecciona un paciente</option>
                      {patientsOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Fecha
                  <input type="date" name="fecha" value={form.fecha} onChange={onChange} className={inputClasses} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Título breve
                  <input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={onChange}
                    placeholder="Ej. Recordar laboratorio"
                    className={inputClasses}
                  />
                </label>
              </div>
              <textarea
                name="detalle"
                value={form.detalle}
                onChange={onChange}
                rows={6}
                placeholder="Ej. Confirmar resultados de laboratorio en 7 días."
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-800">Checklist rápido</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Confirmar próxima cita antes de despedir.</li>
                  <li>• Registrar indicaciones en el historial.</li>
                  <li>• Enviar recordatorio al tutor por correo.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-indigo-50/70 p-5 text-sm text-indigo-700">
                <h3 className="text-sm font-semibold text-indigo-600">Consejo del día</h3>
                <p className="mt-2">
                  Aprovecha la consulta para reforzar hábitos de salud con el tutor y agenda seguimiento de vacunas pendientes.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-indigo-50/70 px-5 py-4 text-sm text-indigo-700 md:flex-row md:items-center md:justify-between">
            <p className="font-medium">
              Guarda tus notas en el historial del paciente para mantener a todo el equipo alineado.
            </p>
            <button
              type="button"
              onClick={saveNote}
              disabled={saving || loadingPatients}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span aria-hidden>📝</span>
              {saving ? "Guardando…" : "Guardar recordatorio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
