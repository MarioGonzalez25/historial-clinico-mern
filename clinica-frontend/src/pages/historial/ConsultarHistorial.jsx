import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";
import { HistorialAPI } from "../../api/historial";
import { useAuthStore } from "../../store/auth";

const inputClasses =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100";

const allowedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const maxFileSize = 2 * 1024 * 1024; // 2 MB
const maxFiles = 5;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });

function formatDate(iso) {
  if (!iso) return "--";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("es-GT", { dateStyle: "medium" });
}

function AttachmentCard({ archivo }) {
  const isImage = archivo?.tipo?.startsWith("image/");
  const sizeKb = archivo?.tamano ? Math.round((archivo.tamano / 1024) * 10) / 10 : null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        {isImage ? (
          <img src={archivo.dataUrl} alt={archivo.nombre} className="h-40 w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-40 items-center justify-center bg-indigo-50 text-5xl">📄</div>
        )}
      </div>
      <div className="mt-3 space-y-2 text-xs">
        <p className="truncate font-semibold text-slate-700" title={archivo.nombre}>
          {archivo.nombre}
        </p>
        <div className="flex items-center justify-between text-slate-500">
          <span>{archivo.tipo?.split("/")[1]?.toUpperCase() || "ARCH"}</span>
          {sizeKb ? <span>{sizeKb} KB</span> : null}
        </div>
        <a
          href={archivo.dataUrl}
          target="_blank"
          rel="noreferrer"
          download={archivo.nombre || "adjunto"}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-100"
        >
          <span aria-hidden>⬇️</span>
          Ver archivo
        </a>
      </div>
    </div>
  );
}

function HistorialEntryForm({ patientId, onCreated }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 16),
    motivoConsulta: "",
    diagnostico: "",
    tratamiento: "",
    notas: "",
  });
  const [archivos, setArchivos] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      fecha: new Date().toISOString().slice(0, 16),
      motivoConsulta: "",
      diagnostico: "",
      tratamiento: "",
      notas: "",
    });
    setArchivos([]);
  }, [patientId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    let next = [...archivos];
    for (const file of files) {
      if (next.length >= maxFiles) {
        toast.error(`Solo puedes adjuntar hasta ${maxFiles} archivos por evolución`);
        break;
      }
      if (!allowedFileTypes.includes(file.type)) {
        toast.error(`${file.name} tiene un formato no permitido`);
        continue;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} supera el límite de 2MB`);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        next = next.concat({
          nombre: file.name,
          tipo: file.type,
          tamano: file.size,
          dataUrl,
        });
      } catch (err) {
        console.error("[historial] file", err);
        toast.error(`No se pudo leer ${file.name}`);
      }
    }

    setArchivos(next.slice(0, maxFiles));
    event.target.value = "";
  };

  const removeAttachment = (index) => {
    setArchivos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!patientId) return toast.error("Selecciona un paciente");
    if (!form.fecha) return toast.error("Define la fecha de la evolución");
    if (!form.motivoConsulta.trim()) return toast.error("Describe el motivo de consulta");
    if (!form.diagnostico.trim()) return toast.error("Ingresa el diagnóstico principal");
    if (!form.tratamiento.trim()) return toast.error("Indica el tratamiento");

    const fechaISO = new Date(form.fecha);
    if (Number.isNaN(fechaISO.getTime())) return toast.error("La fecha de la evolución no es válida");

    try {
      setSaving(true);
      await HistorialAPI.create({
        patientId,
        fecha: fechaISO.toISOString(),
        motivoConsulta: form.motivoConsulta.trim(),
        diagnostico: form.diagnostico.trim(),
        tratamiento: form.tratamiento.trim(),
        notas: form.notas.trim() || undefined,
        archivos,
      });
      toast.success("Evolución agregada al historial");
      if (typeof onCreated === "function") onCreated();
      setForm({
        fecha: new Date().toISOString().slice(0, 16),
        motivoConsulta: "",
        diagnostico: "",
        tratamiento: "",
        notas: "",
      });
      setArchivos([]);
    } catch (err) {
      console.error("[historial] create", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo registrar la evolución";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800">Actualizar historial del paciente</h2>
      <p className="mt-2 text-sm text-slate-500">
        Registra lo ocurrido en la consulta y agrega material de apoyo como resultados o fotografías.
      </p>

      {!patientId ? (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Selecciona primero un paciente para poder añadir evoluciones.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Fecha y hora
              <input type="datetime-local" name="fecha" value={form.fecha} onChange={handleChange} className={inputClasses} />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Motivo de consulta
              <input
                type="text"
                name="motivoConsulta"
                value={form.motivoConsulta}
                onChange={handleChange}
                placeholder="Ej. Dolor abdominal"
                className={inputClasses}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Diagnóstico
              <input
                type="text"
                name="diagnostico"
                value={form.diagnostico}
                onChange={handleChange}
                placeholder="Diagnóstico principal"
                className={inputClasses}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Tratamiento indicado
              <input
                type="text"
                name="tratamiento"
                value={form.tratamiento}
                onChange={handleChange}
                placeholder="Medicamentos, reposo, etc."
                className={inputClasses}
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-semibold text-slate-600">
            Notas adicionales (opcional)
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleChange}
              rows={3}
              placeholder="Recomendaciones o hallazgos relevantes"
              className={`${inputClasses} min-h-[100px] resize-none`}
            />
          </label>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-600">
              Adjuntar archivos (máx. {maxFiles})
            </label>
            <input
              type="file"
              multiple
              accept={allowedFileTypes.join(",")}
              onChange={handleFiles}
              className="block w-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:border-indigo-300"
            />
            {archivos.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {archivos.map((archivo, index) => (
                  <li key={`${archivo.nombre}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <p className="truncate font-semibold text-slate-700" title={archivo.nombre}>
                      {archivo.nombre}
                    </p>
                    <p className="mt-1 text-slate-500">{archivo.tipo}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-slate-400">{Math.round(archivo.tamano / 1024)} KB</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="rounded-lg px-2 py-1 font-semibold text-rose-500 hover:bg-rose-50"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-indigo-50/70 px-5 py-4 text-sm text-indigo-700 md:flex-row md:items-center md:justify-between">
            <p className="font-medium">Verifica la información antes de guardar. Podrás consultarla inmediatamente.</p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/30 transition hover:shadow-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span aria-hidden>💾</span>
              {saving ? "Guardando…" : "Guardar evolución"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ConsultarHistorial() {
  const { user } = useAuthStore();
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);

  const canCreate = user?.rol === "ADMIN" || user?.rol === "MEDICO";

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoadingPatients(true);
        const response = await PacientesAPI.list({ limit: 200, sort: "nombreCompleto" });
        const data = response.data || [];
        setPacientes(data);
        setSelectedPatient(data?.[0]?._id || data?.[0]?.id || "");
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

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return patientsOptions;
    const term = searchTerm.trim().toLowerCase();
    return patientsOptions.filter((option) => option.label.toLowerCase().includes(term));
  }, [patientsOptions, searchTerm]);

  useEffect(() => {
    if (!filteredOptions.length) {
      setSelectedPatient("");
      return;
    }
    const stillExists = filteredOptions.some((option) => option.id === selectedPatient);
    if (!stillExists) {
      setSelectedPatient(filteredOptions[0].id);
    }
  }, [filteredOptions, selectedPatient]);

  const consultar = useCallback(async (patientId) => {
    if (!patientId) {
      setEntries([]);
      setTotal(0);
      return;
    }
    try {
      setLoadingEntries(true);
      const response = await HistorialAPI.listByPatient(patientId, { limit: 0 });
      setEntries(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error("[historial] list", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo consultar el historial";
      toast.error(message);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    if (!loadingPatients) {
      consultar(selectedPatient);
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
              Busca pacientes por nombre y revisa la línea de tiempo de sus evoluciones médicas, estudios y recomendaciones.
            </p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,_1.3fr)_minmax(0,_1fr)]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
                <h2 className="text-base font-semibold text-slate-800">Buscar paciente</h2>
                {loadingPatients ? (
                  <p className="mt-4 text-sm text-slate-500">Cargando pacientes…</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    <label className="block space-y-2 text-sm font-semibold text-slate-600">
                      Buscar por nombre
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Escribe el nombre del paciente"
                        className={inputClasses}
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-semibold text-slate-600">
                      Paciente
                      <select
                        className={`${inputClasses} text-slate-700`}
                        value={selectedPatient}
                        onChange={(event) => setSelectedPatient(event.target.value)}
                      >
                        <option value="">Selecciona un paciente</option>
                        {filteredOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => consultar(selectedPatient)}
                      disabled={!selectedPatient}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span aria-hidden>🔄</span>
                      Actualizar historial
                    </button>
                    {total > 0 && (
                      <p className="text-xs text-slate-400">{total} registros encontrados</p>
                    )}
                  </div>
                )}
              </div>

              {canCreate ? (
                <HistorialEntryForm patientId={selectedPatient} onCreated={() => consultar(selectedPatient)} />
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-800">Modo lectura</h2>
                  <p className="mt-2">
                    Puedes revisar la información clínica y los adjuntos de cada cita, pero solo el personal médico puede actualizar
                    el expediente.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Historial clínico</h2>
                {loadingEntries ? (
                  <p className="mt-4 text-sm text-slate-500">Cargando historial…</p>
                ) : entries.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">Selecciona un paciente para visualizar su historial clínico.</p>
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
                        {item.signosVitales && (
                          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                            {item.signosVitales.presion && <span>Presión: {item.signosVitales.presion}</span>}
                            {item.signosVitales.frecuenciaCardiaca && <span>FC: {item.signosVitales.frecuenciaCardiaca} lpm</span>}
                            {item.signosVitales.temperatura && <span>Temperatura: {item.signosVitales.temperatura} °C</span>}
                            {item.signosVitales.peso && <span>Peso: {item.signosVitales.peso} kg</span>}
                            {item.signosVitales.altura && <span>Altura: {item.signosVitales.altura} m</span>}
                            {item.signosVitales.saturacionOxigeno && <span>SpO₂: {item.signosVitales.saturacionOxigeno} %</span>}
                          </div>
                        )}
                        {item.archivos?.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Adjuntos de la cita</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {item.archivos.map((archivo, index) => (
                                <AttachmentCard key={`${item._id}-file-${index}`} archivo={archivo} />
                              ))}
                            </div>
                          </div>
                        )}
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
                  {entries.length === 0 && <li className="text-xs text-slate-400">Sin registros recientes.</li>}
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
