import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";
import { useAuthStore } from "../../store/auth";

const formatDate = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-GT", { dateStyle: "medium" });
};

const normalize = (value) => (value || "").toString().toLowerCase();

export default function ListaPacientes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const role = (user?.rol || user?.role || "").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("todos");

  const scope = searchParams.get("mis");
  const isOwnList = scope === "1" || scope === "true";

  const headerTitle = isOwnList
    ? "Mis pacientes"
    : role === "ASISTENTE"
    ? "Pacientes registrados"
    : "Pacientes";
  const headerSubtitle = isOwnList
    ? "Consulta tus pacientes asignados y accede rápidamente a su información clínica."
    : "Revisa la información de contacto, documentos y antecedentes para brindar una atención oportuna.";

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        const response = await PacientesAPI.list({ limit: 200, sort: "nombreCompleto" });
        setPacientes(response?.data || []);
      } catch (err) {
        console.error("[pacientes] list", err);
        const message = err?.response?.data?.error || err?.message || "No se pudieron cargar los pacientes";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  const filteredPacientes = useMemo(() => {
    const term = normalize(search);
    return (pacientes || []).filter((paciente) => {
      if (filterActive === "inactivos" && paciente.activo !== false) return false;
      if (filterActive === "activos" && paciente.activo === false) return false;

      if (!term) return true;
      return [
        paciente.nombreCompleto,
        paciente.nombrePadre,
        paciente.nombreMadre,
        paciente.dpi,
        paciente.nit,
        paciente.telefono,
      ]
        .map(normalize)
        .some((value) => value.includes(term));
    });
  }, [pacientes, search, filterActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ff] via-[#eef2ff] to-[#fdf4ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-60px_rgba(79,70,229,0.55)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Pacientes</p>
            <h1 className="text-3xl font-semibold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">{headerSubtitle}</p>
          </header>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid w-full gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                Buscar por nombre, tutor o documento
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ej. Sofía, González, 1234"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Estado
                <select
                  value={filterActive}
                  onChange={(event) => setFilterActive(event.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Solo activos</option>
                  <option value="inactivos">Solo inactivos</option>
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <button
                type="button"
                onClick={() => navigate("/pacientes/nuevo")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/45"
              >
                <span aria-hidden>➕</span>
                Nuevo paciente
              </button>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-100">
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">Cargando pacientes…</div>
            ) : filteredPacientes.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No se encontraron pacientes con los filtros seleccionados.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Nombre completo</th>
                    <th className="px-5 py-3">Documento</th>
                    <th className="px-5 py-3">Tutores</th>
                    <th className="px-5 py-3">Contacto</th>
                    <th className="px-5 py-3">Creado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {filteredPacientes.map((paciente) => (
                    <tr key={paciente.id || paciente._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{paciente.nombreCompleto}</p>
                        <p className="text-xs text-slate-400">{paciente.sexo || ""}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">{paciente.dpi || "—"}</p>
                        <p className="text-xs text-slate-400">NIT: {paciente.nit || "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">Padre: {paciente.nombrePadre}</p>
                        <p className="text-xs text-slate-400">Madre: {paciente.nombreMadre}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">{paciente.telefono || "—"}</p>
                        <p className="text-xs text-slate-400">{paciente.email || "Sin correo"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">{formatDate(paciente.createdAt)}</p>
                        <p className="text-xs text-slate-400">{paciente.activo === false ? "Inactivo" : "Activo"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
