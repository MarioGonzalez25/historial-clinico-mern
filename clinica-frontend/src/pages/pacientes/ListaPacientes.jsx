import { useCallback, useEffect, useMemo, useState } from "react";
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

const getId = (paciente) => paciente?.id || paciente?._id;

export default function ListaPacientes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const role = (user?.rol || user?.role || "").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("todos");
  const [deletingId, setDeletingId] = useState(null);
  const canEdit = role === "ADMIN" || role === "MEDICO";
  const canDelete = role === "ADMIN" || role === "MEDICO";

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

  const fetchPacientes = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

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

  const handleDelete = async (paciente) => {
    const id = getId(paciente);
    if (!id) return;
    const confirmed = window.confirm(
      `¿Deseas marcar como inactivo al paciente "${paciente.nombreCompleto}"? Podrás verlo en la lista de inactivos.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await PacientesAPI.remove(id);
      toast.success("Paciente marcado como inactivo");
      setPacientes((prev) =>
        prev.map((item) => (getId(item) === id ? { ...item, activo: false } : item))
      );
    } catch (err) {
      console.error("[pacientes] delete", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo eliminar el paciente";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ff] via-[#eef2ff] to-[#fdf4ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-60px_rgba(79,70,229,0.55)] sm:p-8 lg:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Pacientes</p>
            <h1 className="text-3xl font-semibold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">{headerSubtitle}</p>
          </header>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

          <div className="mt-10">
            {loading ? (
              <div className="rounded-2xl border border-slate-100 px-6 py-10 text-center text-sm text-slate-500">
                Cargando pacientes…
              </div>
            ) : filteredPacientes.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 px-6 py-10 text-center text-sm text-slate-500">
                No se encontraron pacientes con los filtros seleccionados.
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-2xl border border-slate-100 md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Nombre completo</th>
                          <th className="px-5 py-3">Documento</th>
                          <th className="px-5 py-3">Tutores</th>
                          <th className="px-5 py-3">Contacto</th>
                          <th className="px-5 py-3">Creado</th>
                          <th className="px-5 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                        {filteredPacientes.map((paciente) => {
                          const id = getId(paciente);
                          const inactive = paciente.activo === false;
                          return (
                            <tr key={id} className={inactive ? "bg-slate-50/70" : "hover:bg-slate-50/70"}>
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
                                <p className="text-xs text-slate-400">{inactive ? "Inactivo" : "Activo"}</p>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/pacientes/${id}/editar`)}
                                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300"
                                    >
                                      Editar
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(paciente)}
                                      disabled={deletingId === id}
                                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {deletingId === id ? "Eliminando…" : "Eliminar"}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-4 md:hidden">
                  {filteredPacientes.map((paciente) => {
                    const id = getId(paciente);
                    const inactive = paciente.activo === false;
                    return (
                      <article
                        key={id}
                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{paciente.nombreCompleto}</h3>
                            <p className="text-xs text-slate-400">{inactive ? "Inactivo" : "Activo"} · {formatDate(paciente.createdAt)}</p>
                          </div>
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                            {paciente.sexo || ""}
                          </span>
                        </div>
                        <dl className="mt-4 space-y-2 text-sm text-slate-600">
                          <div>
                            <dt className="font-semibold text-slate-700">Documento</dt>
                            <dd>DPI: {paciente.dpi || "—"}</dd>
                            <dd>NIT: {paciente.nit || "—"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-700">Tutores</dt>
                            <dd>Padre: {paciente.nombrePadre}</dd>
                            <dd>Madre: {paciente.nombreMadre}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-700">Contacto</dt>
                            <dd>Teléfono: {paciente.telefono || "—"}</dd>
                            <dd>Email: {paciente.email || "Sin correo"}</dd>
                          </div>
                        </dl>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => navigate(`/pacientes/${id}/editar`)}
                              className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300"
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(paciente)}
                              disabled={deletingId === id}
                              className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === id ? "Eliminando…" : "Eliminar"}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
