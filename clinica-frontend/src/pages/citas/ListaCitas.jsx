import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { CitasAPI } from "../../api/citas";
import { UsersAPI } from "../../api/users";
import { useAuthStore } from "../../store/auth";

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

const timeInput = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const dateInput = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getId = (item) => item?._id || item?.id;

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

export default function ListaCitas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const userRole = (user?.rol || user?.role || "").toUpperCase();
  const userId = user?._id || user?.id;

  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    estado: "",
    search: "",
    doctorId: "",
  });
  const [statusModal, setStatusModal] = useState({ open: false, cita: null, value: "" });
  const [statusSaving, setStatusSaving] = useState(false);
  const [reprogramModal, setReprogramModal] = useState({ open: false, cita: null, date: "", start: "", end: "" });
  const [reprogramSaving, setReprogramSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const scope = searchParams.get("mis");
  const isOwnAgenda = scope === "1" || scope === "true";

  useEffect(() => {
    if ((userRole === "ADMIN" || userRole === "ASISTENTE") && doctores.length === 0) {
      UsersAPI.listDoctors()
        .then((response) => setDoctores(response.doctors || []))
        .catch((err) => {
          console.error("[citas] doctors", err);
          toast.error("No se pudieron cargar los médicos disponibles");
        });
    }
  }, [userRole, doctores.length]);

  useEffect(() => {
    if (userRole === "MEDICO" && userId && filters.doctorId !== userId) {
      setFilters((prev) => ({ ...prev, doctorId: userId }));
    }
  }, [userRole, userId, filters.doctorId]);

  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.date) {
        const start = new Date(`${filters.date}T00:00:00`);
        const end = new Date(`${filters.date}T23:59:59.999`);
        params.from = start.toISOString();
        params.to = end.toISOString();
      }
      if (filters.estado) params.estado = filters.estado;
      const doctorFilter = filters.doctorId || (isOwnAgenda && userId) || (userRole === "MEDICO" ? userId : "");
      if (doctorFilter) params.doctorId = doctorFilter;

      const response = await CitasAPI.list(params);
      setCitas(response.data || []);
    } catch (err) {
      console.error("[citas] list", err);
      const message = err?.response?.data?.error || err?.message || "No se pudieron cargar las citas";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filters.date, filters.estado, filters.doctorId, isOwnAgenda, userId, userRole]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const filteredCitas = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    if (!term) return citas;
    return citas.filter((cita) => {
      const paciente = cita.patientId?.nombreCompleto || cita.patientId?.nombre || "";
      const doctor = cita.doctorId?.nombre || "";
      const motivo = cita.motivo || "";
      return [paciente, doctor, motivo].some((value) => value.toLowerCase().includes(term));
    });
  }, [citas, filters.search]);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openStatus = (cita) => {
    setStatusModal({ open: true, cita, value: cita?.estado || "PENDIENTE" });
  };

  const submitStatus = async () => {
    if (!statusModal.cita) return;
    try {
      setStatusSaving(true);
      await CitasAPI.updateEstado(statusModal.cita._id, statusModal.value);
      toast.success("Estado actualizado correctamente");
      setStatusModal({ open: false, cita: null, value: "" });
      fetchCitas();
    } catch (err) {
      console.error("[citas] status", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo actualizar el estado";
      toast.error(message);
    } finally {
      setStatusSaving(false);
    }
  };

  const openReprogram = (cita) => {
    setReprogramModal({
      open: true,
      cita,
      date: dateInput(cita?.inicio) || filters.date,
      start: timeInput(cita?.inicio),
      end: timeInput(cita?.fin),
    });
  };

  const submitReprogram = async () => {
    const { cita, date, start, end } = reprogramModal;
    if (!cita) return;
    if (!date || !start || !end) {
      toast.error("Selecciona fecha y horario completo");
      return;
    }
    const inicio = new Date(`${date}T${start}`);
    const fin = new Date(`${date}T${end}`);
    if (!(inicio instanceof Date) || Number.isNaN(inicio.getTime())) return toast.error("Hora inicial inválida");
    if (!(fin instanceof Date) || Number.isNaN(fin.getTime())) return toast.error("Hora final inválida");
    if (fin <= inicio) return toast.error("La hora final debe ser posterior a la inicial");

    try {
      setReprogramSaving(true);
      await CitasAPI.reprogramar(cita._id, {
        inicio: inicio.toISOString(),
        fin: fin.toISOString(),
      });
      toast.success("Cita reprogramada correctamente");
      setReprogramModal({ open: false, cita: null, date: "", start: "", end: "" });
      fetchCitas();
    } catch (err) {
      console.error("[citas] reprogram", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo reprogramar la cita";
      toast.error(message);
    } finally {
      setReprogramSaving(false);
    }
  };

  const handleDelete = async (cita) => {
    const id = getId(cita);
    if (!id) return;
    const confirmed = window.confirm("¿Deseas cancelar esta cita? Se moverá a la papelera.");
    if (!confirmed) return;
    try {
      setDeletingId(id);
      await CitasAPI.remove(id);
      toast.success("Cita eliminada");
      fetchCitas();
    } catch (err) {
      console.error("[citas] delete", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo eliminar la cita";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const headerTitle = isOwnAgenda ? "Mis citas" : "Citas programadas";
  const headerSubtitle = isOwnAgenda
    ? "Consulta tu agenda personal, confirma pacientes y mantén actualizado el seguimiento clínico."
    : "Consulta la agenda para confirmar asistencia, reagendar o registrar el seguimiento clínico de cada paciente.";

  const doctorOptions = useMemo(() => {
    if (userRole === "MEDICO") return [];
    return doctores.map((doctor) => ({ id: doctor._id || doctor.id, label: doctor.nombre }));
  }, [doctores, userRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ff] via-[#eef2ff] to-[#fdf4ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-60px_rgba(79,70,229,0.55)] sm:p-8 lg:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-500/80">Agenda</p>
            <h1 className="text-3xl font-semibold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">{headerSubtitle}</p>
          </header>

          <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
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
              {(userRole === "ADMIN" || userRole === "ASISTENTE") && (
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Médico
                  <select
                    name="doctorId"
                    value={filters.doctorId}
                    onChange={onFilterChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="">Todos</option>
                    {doctorOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
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

          <div className="mt-10">
            {loading ? (
              <div className="rounded-2xl border border-slate-100 px-6 py-10 text-center text-sm text-slate-500">
                Cargando citas…
              </div>
            ) : filteredCitas.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 px-6 py-10 text-center text-sm text-slate-500">
                No se encontraron citas para los filtros seleccionados.
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-2xl border border-slate-100 md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Horario</th>
                          <th className="px-5 py-3">Paciente</th>
                          <th className="px-5 py-3">Médico</th>
                          <th className="px-5 py-3">Motivo</th>
                          <th className="px-5 py-3">Estado</th>
                          <th className="px-5 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                        {filteredCitas.map((cita) => {
                          const status = STATUS_META[cita.estado] || { label: cita.estado, className: "bg-slate-100 text-slate-600" };
                          const id = getId(cita);
                          return (
                            <tr key={id} className="hover:bg-slate-50/70">
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
                                <div className="flex flex-wrap justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openStatus(cita)}
                                    className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 transition hover:border-violet-300"
                                  >
                                    Cambiar estado
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openReprogram(cita)}
                                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300"
                                  >
                                    Reprogramar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(cita)}
                                    disabled={deletingId === id}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {deletingId === id ? "Eliminando…" : "Eliminar"}
                                  </button>
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
                  {filteredCitas.map((cita) => {
                    const status = STATUS_META[cita.estado] || { label: cita.estado, className: "bg-slate-100 text-slate-600" };
                    const id = getId(cita);
                    return (
                      <article key={id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{cita.patientId?.nombreCompleto || "Paciente"}</h3>
                            <p className="text-xs text-slate-400">{formatDate(cita.inicio)} · {cita.doctorId?.nombre || "--"}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">Horario: {formatHour(cita.inicio)} - {formatHour(cita.fin)}</p>
                        <p className="mt-1 text-sm text-slate-500">Motivo: {cita.motivo || "Sin motivo registrado"}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openStatus(cita)}
                            className="flex-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:border-violet-300"
                          >
                            Cambiar estado
                          </button>
                          <button
                            type="button"
                            onClick={() => openReprogram(cita)}
                            className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300"
                          >
                            Reprogramar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cita)}
                            disabled={deletingId === id}
                            className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === id ? "Eliminando…" : "Eliminar"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-violet-50/60 px-5 py-4 text-sm text-violet-700 md:flex-row md:items-center md:justify-between">
            <p className="font-medium">
              Los cambios en esta tabla se actualizan con la API en vivo. Usa la acción “Actualizar lista” después de crear o modificar una cita.
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

      <Modal
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false, cita: null, value: "" })}
        title="Actualizar estado de la cita"
        footer={[
          <button
            key="cancel"
            type="button"
            onClick={() => setStatusModal({ open: false, cita: null, value: "" })}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Cancelar
          </button>,
          <button
            key="save"
            type="button"
            onClick={submitStatus}
            disabled={statusSaving}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            {statusSaving ? "Guardando…" : "Guardar"}
          </button>,
        ]}
      >
        <p className="text-sm text-slate-500">
          Selecciona el estado actual de la cita para mantener la agenda al día. Se notificará en el panel correspondiente.
        </p>
        <select
          className="mt-4 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
          value={statusModal.value}
          onChange={(event) => setStatusModal((prev) => ({ ...prev, value: event.target.value }))}
        >
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </Modal>

      <Modal
        open={reprogramModal.open}
        onClose={() => setReprogramModal({ open: false, cita: null, date: "", start: "", end: "" })}
        title="Reprogramar cita"
        footer={[
          <button
            key="cancel"
            type="button"
            onClick={() => setReprogramModal({ open: false, cita: null, date: "", start: "", end: "" })}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Cancelar
          </button>,
          <button
            key="save"
            type="button"
            onClick={submitReprogram}
            disabled={reprogramSaving}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            {reprogramSaving ? "Guardando…" : "Guardar cambios"}
          </button>,
        ]}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
            Fecha de la cita
            <input
              type="date"
              value={reprogramModal.date}
              onChange={(event) => setReprogramModal((prev) => ({ ...prev, date: event.target.value }))}
              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Hora inicial
            <input
              type="time"
              value={reprogramModal.start}
              onChange={(event) => setReprogramModal((prev) => ({ ...prev, start: event.target.value }))}
              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-600">
            Hora final
            <input
              type="time"
              value={reprogramModal.end}
              onChange={(event) => setReprogramModal((prev) => ({ ...prev, end: event.target.value }))}
              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
