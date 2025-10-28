const checklist = [
  {
    title: "Signos vitales",
    items: ["Temperatura registrada", "Frecuencia cardiaca", "Saturación de oxígeno"],
  },
  {
    title: "Alertas",
    items: ["Alergias confirmadas", "Medicamentos actuales", "Avisar si requiere ayuno"],
  },
  {
    title: "Logística",
    items: ["Tutor presente", "Consentimiento firmado", "Estudios previos adjuntos"],
  },
];

export default function NotasRapidas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] via-[#eef2ff] to-[#fef6ff]">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 lg:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-[0_28px_80px_-55px_rgba(99,102,241,0.45)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Preparación de consulta</p>
            <h1 className="text-3xl font-semibold text-slate-900">Notas rápidas</h1>
            <p className="text-sm text-slate-500">
              Revisa tu checklist preconsulta y anota recordatorios importantes antes de recibir al paciente.
            </p>
          </header>

          <section className="mt-8 grid gap-6 md:grid-cols-3">
            {checklist.map((block) => (
              <div
                key={block.title}
                className="rounded-2xl border border-slate-100 bg-indigo-50/60 p-5 shadow-sm shadow-indigo-100"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{block.title}</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-indigo-200 text-indigo-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="mt-10 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <h2 className="text-base font-semibold text-slate-800">Notas rápidas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Escribe recordatorios importantes, acuerdos con el tutor o hallazgos que desees destacar al finalizar la cita.
              </p>
              <textarea
                rows="6"
                placeholder="Ej. Confirmar resultados de laboratorio en 7 días."
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-800">Checklist rápido</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Confirmar próxima cita antes de despedir.</li>
                  <li>• Registrar indicaciones en el historial.</li>
                  <li>• Enviar recordatorio al tutor por correo.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-indigo-50/70 p-5 text-sm text-indigo-700">
                <h3 className="text-sm font-semibold text-indigo-600">Consejo del día</h3>
                <p className="mt-2">
                  Aprovecha la consulta para reforzar hábitos de salud con el tutor y agenda seguimiento de vacunas pendientes.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-indigo-50/70 px-5 py-4 text-sm text-indigo-700 md:flex-row md:items-center md:justify-between">
            <p className="font-medium">
              Guarda tus notas en el historial del paciente para mantener a todo el equipo alineado.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40"
            >
              <span aria-hidden>📝</span>
              Guardar recordatorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
