const evoluciones = [
  {
    fecha: "12/03/2024",
    profesional: "Dr. Pérez",
    resumen: "Control general. Paciente estable, se ajusta dosis de hierro.",
  },
  {
    fecha: "25/02/2024",
    profesional: "Dra. Martínez",
    resumen: "Seguimiento nutricional. Se entrega plan alimenticio actualizado.",
  },
  {
    fecha: "08/02/2024",
    profesional: "Dr. Pérez",
    resumen: "Revisión postvacuna. Sin reacciones adversas, se agenda refuerzo.",
  },
];

export default function ConsultarHistorial() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5ff] via-[#eef2ff] to-[#fdf4ff]">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-55px_rgba(79,70,229,0.5)] sm:p-10">
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
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                    Nombre o ID
                    <input
                      type="text"
                      placeholder="Ej. Valeria Gómez"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Fecha inicial
                    <input
                      type="date"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-slate-600">
                    Fecha final
                    <input
                      type="date"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40"
                >
                  <span aria-hidden>🔍</span>
                  Consultar historial
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Documentos adjuntos</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span>Laboratorio - Hemograma completo.pdf</span>
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Descargar</button>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span>Radiografía tórax (feb-2024).zip</span>
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Descargar</button>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span>Plan nutricional actualizado.docx</span>
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Descargar</button>
                  </li>
                </ul>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Evoluciones recientes</h2>
                <ol className="mt-5 space-y-4 text-sm text-slate-600">
                  {evoluciones.map((item) => (
                    <li key={item.fecha} className="relative border-l-2 border-indigo-100 pl-5">
                      <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border border-white bg-indigo-400" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{item.fecha}</p>
                      <p className="mt-1 font-semibold text-slate-800">{item.profesional}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.resumen}</p>
                      <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                        Ver detalle
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 text-sm text-indigo-700">
                <h3 className="text-sm font-semibold text-indigo-600">Próximos pasos</h3>
                <ul className="mt-3 space-y-2">
                  <li>• Registrar evolución posterior a estudios de laboratorio.</li>
                  <li>• Programar cita de seguimiento en 4 semanas.</li>
                  <li>• Compartir resumen clínico con el tutor vía correo.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
