import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { CitasAPI } from "../../api/citas";

const STATUS_META = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
  CONFIRMADA: { label: "Confirmada", className: "bg-emerald-100 text-emerald-600" },
  ATENDIDA: { label: "Atendida", className: "bg-slate-100 text-slate-600" },
  CANCELADA: { label: "Cancelada", className: "bg-rose-100 text-rose-500" },
  NO_ASISTIO: { label: "No asistió", className: "bg-rose-100 text-rose-500" },
};

const formatHour = (iso) => {
  if (!iso) return "--:--";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (iso) => {
  if (!iso) return "--";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("es-GT", { dateStyle: "medium" });
};

export default function ListaCitas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    estado: "",
    search: "",
  });

  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (filters.date) {
        const start = new Date(filters.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        params.from = start.toISOString();
        params.to = end.toISOString();
      }
      if (filters.estado) params.estado = filters.estado;
      const response = await CitasAPI.list(params);
      setCitas(response.data || []);
    } catch (err) {
      console.error("[citas] list", err);
      const message = err?.response?.data?.error || err?.message || "No se pudieron cargar las citas";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filters.date, filters.estado]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const filteredCitas = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    if (!term) return citas;
    return citas.filter((cita) => {
      const paciente = cita.patientId?.nombreCompleto || cita.patientId?.nombre || "";
      const doctor = cita.doctorId?.nombre || "";
      return paciente.toLowerCase().includes(term) || doctor.toLowerCase().includes(term) || (cita.motivo || "").toLowerCase().includes(term);
    });
  }, [citas, filters.search]);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const isOwnAgenda = (() => {
    const scope = searchParams.get("mis");
    return scope === "1" || scope === "true";
  })();

  const headerTitle = isOwnAgenda ? "Mis citas" : "Citas programadas";
  const headerSubtitle = isOwnAgenda
    ? "Consulta tu agenda personal, confirma pacientes y mantén actualizado el seguimiento clínico."
    : "Consulta la agenda para confirmar asistencia, reagendar o registrar el seguimiento clínico de cada paciente.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ff] via-[#eef2ff] to-[#fdf4ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-60px_rgba(79,70,229,0.55)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-500/80">Agenda</p>
            <h1 className="text-3xl font-semibold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">{headerSubtitle}</p>
          </header>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid w-full gap-4 md:grid-cols-4">
              <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                Buscar por paciente, médico o motivo
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={onFilterChange}
                  placeholder="Ej. Ana, seguimiento, Pérez"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Fecha
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={onFilterChange}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Estado
                <select
                  name="estado"
                  value={filters.estado}
                  onChange={onFilterChange}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Todos</option>
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <button
                type="button"
                onClick={fetchCitas}
                className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-semibold text-violet-600 transition hover:border-violet-300"
              >
                Actualizar lista
              </button>
              <button
                type="button"
                onClick={() => navigate("/citas/nueva")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/45"
              >
                <span aria-hidden>➕</span>
                Nueva cita
              </button>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-100">
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">Cargando citas…</div>
            ) : filteredCitas.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No se encontraron citas para los filtros seleccionados.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Horario</th>
                    <th className="px-5 py-3">Paciente</th>
                    <th className="px-5 py-3">Médico</th>
                    <th className="px-5 py-3">Motivo</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {filteredCitas.map((cita) => {
                    const status = STATUS_META[cita.estado] || { label: cita.estado, className: "bg-slate-100 text-slate-600" };
                    return (
                      <tr key={cita._id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          <div>{formatHour(cita.inicio)} - {formatHour(cita.fin)}</div>
                          <div className="text-xs font-medium text-slate-400">{formatDate(cita.inicio)}</div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{cita.patientId?.nombreCompleto || cita.patientId?.nombre || "Paciente"}</p>
                          <p className="text-xs text-slate-400">{cita.patientId?.telefono || ""}</p>
                        </td>
                        <td className="px-5 py-4">{cita.doctorId?.nombre || "--"}</td>
                        <td className="px-5 py-4">{cita.motivo || "Sin motivo registrado"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => navigate("/historial/consultar")}
                              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                            >
                              Ver historial
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate("/historial/evolucion")}
                              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 hover:border-violet-300"
                            >
                              Registrar evolución
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-violet-50/60 px-5 py-4 text-sm text-violet-700 md:flex-row md:items-center md:justify-between">
            <p className="font-medium">
              Los cambios en esta tabla se actualizan con la API en vivo. Usa la acción “Actualizar lista” después de crear o mo
dificar una cita.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-2 text-xs font-semibold text-violet-600 transition hover:border-violet-300"
            >
              Imprimir agenda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
