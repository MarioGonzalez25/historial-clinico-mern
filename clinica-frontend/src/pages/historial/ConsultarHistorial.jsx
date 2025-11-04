import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";
import { HistorialAPI } from "../../api/historial";

const inputClasses =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100";

export default function ConsultarHistorial() {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "" });
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1 });

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoadingPatients(true);
        const response = await PacientesAPI.list({ limit: 100, sort: "nombreCompleto" });
        setPacientes(response.data || []);
        setSelectedPatient(response.data?.[0]?._id || response.data?.[0]?.id || "");
      } catch (err) {
        console.error("[historial] pacientes", err);
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

  const formatDate = (iso) => {
    if (!iso) return "--";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("es-GT", { dateStyle: "medium" });
  };

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const consultar = useCallback(async () => {
    if (!selectedPatient) return toast.error("Selecciona un paciente");
    try {
      setLoadingEntries(true);
      const params = {};
      if (filters.from) {
        const fromDate = new Date(`${filters.from}T00:00:00`);
        params.from = fromDate.toISOString();
      }
      if (filters.to) {
        const toDate = new Date(`${filters.to}T23:59:59.999`);
        params.to = toDate.toISOString();
      }
      const response = await HistorialAPI.listByPatient(selectedPatient, params);
      setEntries(response.items || []);
      setMeta({ total: response.total || 0, page: response.page || 1 });
    } catch (err) {
      console.error("[historial] list", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo consultar el historial";
      toast.error(message);
    } finally {
      setLoadingEntries(false);
    }
  }, [filters.from, filters.to, selectedPatient]);

  useEffect(() => {
    if (!loadingPatients && selectedPatient) {
      consultar();
    }
  }, [consultar, loadingPatients, selectedPatient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5ff] via-[#eef2ff] to-[#fdf4ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-55px_rgba(79,70,229,0.5)] sm:p-8 lg:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Historial clínico</p>
            <h1 className="text-3xl font-semibold text-slate-900">Consultar historial</h1>
            <p className="text-sm text-slate-500">
              Busca pacientes y revisa la línea de tiempo de sus evoluciones médicas, estudios y recomendaciones.
            </p>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
                <h2 className="text-base font-semibold text-slate-800">Buscar paciente</h2>
                {loadingPatients ? (
                  <p className="mt-4 text-sm text-slate-500">Cargando pacientes…</p>
                ) : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                      Paciente
                      <select
                        className={`${inputClasses} text-slate-700`}
                        value={selectedPatient}
                        onChange={(event) => setSelectedPatient(event.target.value)}
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
                      Fecha inicial
                      <input type="date" name="from" value={filters.from} onChange={onFilterChange} className={inputClasses} />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-600">
                      Fecha final
                      <input type="date" name="to" value={filters.to} onChange={onFilterChange} className={inputClasses} />
                    </label>
                  </div>
                )}
                <button
                  type="button"
                  onClick={consultar}
                  disabled={loadingPatients || !selectedPatient}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span aria-hidden>🔍</span>
                  Consultar historial
                </button>
                {meta.total > 0 && (
                  <p className="mt-4 text-xs text-slate-400">{meta.total} registros encontrados</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Historial clínico</h2>
                {loadingEntries ? (
                  <p className="mt-4 text-sm text-slate-500">Cargando historial…</p>
                ) : entries.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    Selecciona un paciente y rango de fechas para consultar sus evoluciones.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-4 text-sm text-slate-600">
                    {entries.map((item) => (
                      <li key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                          <span>{formatDate(item.fecha)}</span>
                          <span>ID #{item._id.slice(-6)}</span>
                        </div>
                        <p className="mt-2 text-base font-semibold text-slate-800">{item.diagnostico}</p>
                        <p className="mt-1 text-sm text-slate-500">Motivo: {item.motivoConsulta}</p>
                        <p className="mt-1 text-sm text-slate-500">Tratamiento: {item.tratamiento}</p>
                        {item.notas && <p className="mt-2 text-sm text-slate-600">Notas: {item.notas}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Resúmenes recientes</h2>
                <ol className="mt-5 space-y-4 text-sm text-slate-600">
                  {entries.slice(0, 5).map((item) => (
                    <li key={item._id} className="relative border-l-2 border-indigo-100 pl-5">
                      <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border border-white bg-indigo-400" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{formatDate(item.fecha)}</p>
                      <p className="mt-1 font-semibold text-slate-800">{item.diagnostico}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.motivoConsulta}</p>
                    </li>
                  ))}
                  {entries.length === 0 && (
                    <li className="text-xs text-slate-400">Sin registros recientes.</li>
                  )}
                </ol>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 text-sm text-indigo-700">
                <h3 className="text-sm font-semibold text-indigo-600">Consejos de seguimiento</h3>
                <ul className="mt-3 space-y-2">
                  <li>• Revisa alergias antes de prescribir nuevos tratamientos.</li>
                  <li>• Agenda controles según la gravedad del diagnóstico.</li>
                  <li>• Comparte el resumen clínico con el tutor cuando sea necesario.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
