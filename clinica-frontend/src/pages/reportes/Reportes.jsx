import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { DashboardAPI } from "../../api/dashboard";

const gradientCards = [
  { key: "pacientes", title: "Total pacientes", color: "from-violet-500/90 to-indigo-500/90" },
  { key: "citasHoy", title: "Citas hoy", color: "from-sky-500/90 to-indigo-500/90" },
  { key: "nuevosPacientes7d", title: "Ingresos nuevos (7 días)", color: "from-emerald-500/90 to-teal-500/90" },
];

const formatNumber = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-GT").format(value);
};

const statusLabels = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

export default function Reportes() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const data = await DashboardAPI.overview();
        setOverview(data);
      } catch (err) {
        console.error("[reportes] overview", err);
        const message = err?.response?.data?.error || err?.message || "No se pudieron cargar los reportes";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const totals = overview?.totals || {};
  const proximas = overview?.proximasCitas || [];

  const cards = gradientCards.map((card) => ({
    ...card,
    value: formatNumber(totals[card.key]),
    detail:
      card.key === "nuevosPacientes7d"
        ? "Últimos 7 días"
        : card.key === "citasHoy"
        ? `${formatNumber(totals.citasPendientesHoy || 0)} por atender`
        : `${formatNumber(totals.citasSemana || 0)} citas esta semana`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ff] via-[#eef2ff] to-[#fef6ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_25px_80px_-50px_rgba(59,130,246,0.45)] sm:p-10">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Seguimiento</p>
            <h1 className="text-3xl font-semibold text-slate-900">Reportes y estadísticas</h1>
            <p className="text-sm text-slate-500">
              Visualiza indicadores clave de rendimiento para tomar decisiones informadas sobre el funcionamiento de la
              clínica.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl border border-slate-100 bg-gradient-to-br ${card.color} p-[1px] shadow-[0_25px_60px_-45px_rgba(79,70,229,0.45)]`}
              >
                <div className="rounded-[1.4rem] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.title}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
                <h2 className="text-lg font-semibold text-slate-800">Resumen semanal</h2>
                <p className="mt-2 text-sm text-slate-500">
                  La carga de trabajo refleja {formatNumber(totals.citasSemana || 0)} citas programadas esta semana y
                  {" "}
                  {formatNumber(totals.evolucionesSemana || 0)} evoluciones registradas.
                </p>
                <ul className="mt-5 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                    <span>Evoluciones registradas</span>
                    <span className="font-semibold text-indigo-600">{formatNumber(totals.evolucionesSemana || 0)}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                    <span>Citas por atender hoy</span>
                    <span className="font-semibold text-rose-500">{formatNumber(totals.citasPendientesHoy || 0)}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                    <span>Total pacientes activos</span>
                    <span className="font-semibold text-emerald-500">{formatNumber(totals.pacientes || 0)}</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">Notas destacadas</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li>✔ Mantén confirmaciones para {formatNumber(totals.citasPendientesHoy || 0)} pacientes en espera.</li>
                  <li>✔ Revisa {formatNumber(totals.evolucionesSemana || 0)} evoluciones capturadas esta semana.</li>
                  <li>✔ Actualiza indicadores administrativos desde el panel de usuarios.</li>
                </ul>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-[0_30px_70px_-50px_rgba(79,70,229,0.7)]">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Objetivo del mes</p>
                <p className="mt-3 text-2xl font-semibold">Reducir ausencias</p>
                <p className="mt-2 text-sm text-white/80">
                  Refuerza confirmaciones con pacientes pendientes y comparte recordatorios con los tutores.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800">Próximas citas</h3>
                {loading ? (
                  <p className="mt-3 text-slate-500">Cargando próximas citas…</p>
                ) : proximas.length === 0 ? (
                  <p className="mt-3 text-slate-500">No hay citas próximas registradas.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {proximas.slice(0, 5).map((cita) => (
                      <li key={cita.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{cita.paciente?.nombre || "Paciente"}</p>
                        <p className="text-xs text-slate-500">{new Date(cita.inicio).toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })}</p>
                        <p className="text-xs text-slate-400">Estado: {statusLabels[cita.estado] || cita.estado}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}
