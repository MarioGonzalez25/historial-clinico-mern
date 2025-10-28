import { useNavigate } from "react-router-dom";

const citas = [
  {
    hora: "09:00",
    paciente: "Ana María López",
    medico: "Dr. Pérez",
    motivo: "Control pediátrico",
    estado: "Confirmada",
    estadoClass: "bg-emerald-100 text-emerald-600",
  },
  {
    hora: "10:30",
    paciente: "Luis Herrera",
    medico: "Dra. Martínez",
    motivo: "Vacunación",
    estado: "Pendiente",
    estadoClass: "bg-amber-100 text-amber-700",
  },
  {
    hora: "12:15",
    paciente: "Valeria Gómez",
    medico: "Dr. Pérez",
    motivo: "Seguimiento nutricional",
    estado: "En sala",
    estadoClass: "bg-sky-100 text-sky-600",
  },
  {
    hora: "16:00",
    paciente: "Ignacio Rivas",
    medico: "Dra. Flores",
    motivo: "Consulta general",
    estado: "Confirmada",
    estadoClass: "bg-emerald-100 text-emerald-600",
  },
];

export default function ListaCitas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ff] via-[#eef2ff] to-[#fdf4ff]">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-60px_rgba(79,70,229,0.55)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-500/80">Agenda</p>
            <h1 className="text-3xl font-semibold text-slate-900">Citas programadas</h1>
            <p className="text-sm text-slate-500">
              Consulta la agenda diaria para confirmar asistencia, reagendar o registrar el seguimiento de cada paciente.
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid w-full gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                Buscar paciente o tutor
                <input
                  type="text"
                  placeholder="Ej. Ana, Gómez, tutor"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Fecha
                <input
                  type="date"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => navigate("/citas/nueva")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/45"
            >
              <span aria-hidden>➕</span>
              Nueva cita
            </button>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Hora</th>
                  <th className="px-5 py-3">Paciente</th>
                  <th className="px-5 py-3">Médico</th>
                  <th className="px-5 py-3">Motivo</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {citas.map((cita) => (
                  <tr key={`${cita.hora}-${cita.paciente}`} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-semibold text-slate-800">{cita.hora}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{cita.paciente}</p>
                      <p className="text-xs text-slate-400">Tutor confirmado</p>
                    </td>
                    <td className="px-5 py-4">{cita.medico}</td>
                    <td className="px-5 py-4">{cita.motivo}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cita.estadoClass}`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigate("/historial/consultar")}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                        >
                          Ver detalle
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-violet-50/60 px-5 py-4 text-sm text-violet-700 md:flex-row md:items-center md:justify-between">
            <p className="font-medium">
              Integra la API de citas para visualizar información en tiempo real y actualizar estados desde este tablero.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-2 text-xs font-semibold text-violet-600 transition hover:border-violet-300"
            >
              Descargar agenda (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
