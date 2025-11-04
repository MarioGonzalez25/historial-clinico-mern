import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { CitasAPI } from "../../api/citas";
import { PacientesAPI } from "../../api/pacientes";
import { UsersAPI } from "../../api/users";
import { useAuthStore } from "../../store/auth";

const fieldClasses =
  "block w-full rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100/70 transition";

const estadoOptions = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADA", label: "Confirmada" },
];

export default function NuevaCita() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
    motivo: "",
    notas: "",
    estado: "PENDIENTE",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pacientesResp, doctoresResp] = await Promise.all([
          PacientesAPI.list({ limit: 100, sort: "nombreCompleto" }),
          UsersAPI.listDoctors(),
        ]);
        setPacientes(pacientesResp.data || []);
        setDoctores(doctoresResp.doctors || []);

        const doctorIdFromUser = user?.rol === "MEDICO" ? user.id : "";
        setForm((prev) => ({
          ...prev,
          patientId: pacientesResp.data?.[0]?._id || pacientesResp.data?.[0]?.id || "",
          doctorId: doctorIdFromUser || doctoresResp.doctors?.[0]?._id || doctoresResp.doctors?.[0]?.id || "",
        }));
      } catch (err) {
        console.error("[citas] init", err);
        const message = err?.response?.data?.error || err?.message || "No se pudieron cargar los catálogos";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const patientsOptions = useMemo(
    () =>
      pacientes.map((paciente) => ({
        id: paciente._id || paciente.id,
        label: paciente.nombreCompleto,
      })),
    [pacientes]
  );

  const doctorsOptions = useMemo(
    () =>
      doctores.map((doctor) => ({
        id: doctor._id || doctor.id,
        label: doctor.nombre,
      })),
    [doctores]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.patientId) return toast.error("Selecciona un paciente");
    if (!form.doctorId) return toast.error("Selecciona un médico");
    if (!form.date) return toast.error("Selecciona la fecha de la cita");
    if (!form.startTime || !form.endTime) return toast.error("Define el horario de la cita");

    const inicio = new Date(`${form.date}T${form.startTime}`);
    const fin = new Date(`${form.date}T${form.endTime}`);
    if (!(inicio instanceof Date) || Number.isNaN(inicio.getTime())) return toast.error("La hora inicial es inválida");
    if (!(fin instanceof Date) || Number.isNaN(fin.getTime())) return toast.error("La hora final es inválida");
    if (fin <= inicio) return toast.error("La hora final debe ser mayor a la inicial");

    try {
      setSaving(true);
      await CitasAPI.create({
        patientId: form.patientId,
        doctorId: form.doctorId,
        inicio: inicio.toISOString(),
        fin: fin.toISOString(),
        motivo: form.motivo,
        notas: form.notas,
        estado: form.estado,
      });
      toast.success("Cita registrada correctamente");
      navigate("/citas");
    } catch (err) {
      console.error("[citas] create", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo registrar la cita";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1e5ff] via-[#f0f9ff] to-[#fef2ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_25px_80px_-50px_rgba(79,70,229,0.6)] sm:p-8 lg:p-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-500/80">Agenda clínica</p>
            <h1 className="text-3xl font-semibold text-slate-900">Agendar nueva cita</h1>
            <p className="text-sm text-slate-500">
              Registra rápidamente una nueva cita indicando el paciente, el especialista y el motivo de atención. El sistema
              valida conflictos en la agenda automáticamente.
            </p>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-violet-100 bg-violet-50/60 px-5 py-4 text-sm text-violet-600">
              Cargando catálogos de pacientes y médicos…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Paciente
                  <select
                    name="patientId"
                    value={form.patientId}
                    onChange={onChange}
                    className={`${fieldClasses} text-slate-700`}
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
                  Médico responsable
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={onChange}
                    className={`${fieldClasses} text-slate-700`}
                  >
                    <option value="">Selecciona un médico</option>
                    {doctorsOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Fecha
                  <input type="date" name="date" value={form.date} onChange={onChange} className={fieldClasses} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Estado
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={onChange}
                    className={`${fieldClasses} text-slate-700`}
                  >
                    {estadoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Hora de inicio
                  <input type="time" name="startTime" value={form.startTime} onChange={onChange} className={fieldClasses} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Hora de finalización
                  <input type="time" name="endTime" value={form.endTime} onChange={onChange} className={fieldClasses} />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Motivo de la cita
                  <input
                    type="text"
                    name="motivo"
                    value={form.motivo}
                    onChange={onChange}
                    placeholder="Control, seguimiento, vacunación..."
                    className={fieldClasses}
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Notas adicionales (opcional)
                  <textarea
                    name="notas"
                    value={form.notas}
                    onChange={onChange}
                    rows={3}
                    placeholder="Instrucciones para recepción o recordatorios"
                    className={`${fieldClasses} min-h-[110px] resize-none`}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-violet-50/80 px-5 py-4 text-sm text-violet-700 md:flex-row md:items-center md:justify-between">
                <p className="font-medium">
                  El sistema valida solapamientos para paciente y médico. Si detectas un conflicto podrás reprogramar la cita desd
                  e la agenda.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Guardando..." : "Guardar cita"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
