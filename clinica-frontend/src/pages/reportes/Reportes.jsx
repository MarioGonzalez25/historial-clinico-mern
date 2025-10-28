const cards = [
  {
    titulo: "Total pacientes",
    valor: "245",
    detalle: "+12% vs. mes anterior",
    color: "from-violet-500/90 to-indigo-500/90",
  },
  {
    titulo: "Citas hoy",
    valor: "12",
    detalle: "4 en seguimiento",
    color: "from-sky-500/90 to-indigo-500/90",
  },
  {
    titulo: "Ingresos nuevos",
    valor: "5",
    detalle: "3 referidos",
    color: "from-emerald-500/90 to-teal-500/90",
  },
];

export default function Reportes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ff] via-[#eef2ff] to-[#fef6ff]">
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
                key={card.titulo}
                className={`rounded-2xl border border-slate-100 bg-gradient-to-br ${card.color} p-[1px] shadow-[0_25px_60px_-45px_rgba(79,70,229,0.45)]`}
              >
                <div className="rounded-[1.4rem] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.titulo}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{card.valor}</p>
                  <p className="mt-2 text-sm text-slate-500">{card.detalle}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
                <h2 className="text-lg font-semibold text-slate-800">Rendimiento semanal</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Mantén un control de ocupación y atención prioritaria para anticipar necesidades de personal.
                </p>
                <ul className="mt-5 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                    <span>Consultas completadas</span>
                    <span className="font-semibold text-indigo-600">86%</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                    <span>Tasa de ausencias</span>
                    <span className="font-semibold text-rose-500">7%</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                    <span>Tiempo promedio de espera</span>
                    <span className="font-semibold text-emerald-500">12 min</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">Notas destacadas</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li>✔ Revisar el inventario de vacunas pediátricas para el fin de semana.</li>
                  <li>✔ Incrementar turnos virtuales los martes y jueves.</li>
                  <li>✔ Enviar recordatorio de encuestas de satisfacción a los tutores.</li>
                </ul>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-[0_30px_70px_-50px_rgba(79,70,229,0.7)]">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Objetivo del mes</p>
                <p className="mt-3 text-2xl font-semibold">Reducir ausencias al 5%</p>
                <p className="mt-2 text-sm text-white/80">
                  Reforzar confirmaciones vía WhatsApp y llamadas para citas con alta demanda.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800">Próximos pasos</h3>
                <ul className="mt-3 space-y-2">
                  <li>• Programar capacitación de asistentes en triage digital.</li>
                  <li>• Actualizar reportes de productividad médica mensual.</li>
                  <li>• Preparar presentación de indicadores para junta directiva.</li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}
