const inputBase =
  "block w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100 transition";

export default function RegistrarEvolucion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5ff] via-[#eef2ff] to-[#fdf2ff]">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-55px_rgba(56,189,248,0.55)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-500/80">Historial clínico</p>
            <h1 className="text-3xl font-semibold text-slate-900">Registrar evolución</h1>
            <p className="text-sm text-slate-500">
              Documenta los hallazgos clínicos de la consulta para mantener actualizado el expediente del paciente.
            </p>
          </header>

          <form className="mt-10 space-y-10">
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Datos de la consulta</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Paciente
                  <input type="text" name="paciente" placeholder="Ej. Valeria Gómez" className={inputBase} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Fecha de evolución
                  <input type="date" name="fecha" className={inputBase} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Profesional responsable
                  <input type="text" name="medico" placeholder="Nombre del médico" className={inputBase} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Próximo control
                  <input type="date" name="proximoControl" className={inputBase} />
                </label>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Resumen clínico</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Motivo de consulta
                  <textarea
                    name="motivo"
                    rows="3"
                    placeholder="Describe el motivo principal de la visita"
                    className={`${inputBase} min-h-[110px] resize-none`}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Hallazgos relevantes
                  <textarea
                    name="hallazgos"
                    rows="4"
                    placeholder="Anota signos, síntomas y resultados de exploración física"
                    className={`${inputBase} min-h-[140px] resize-none`}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Diagnóstico
                  <input type="text" name="diagnostico" placeholder="Diagnóstico principal" className={inputBase} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Tratamiento indicado
                  <input type="text" name="tratamiento" placeholder="Plan terapéutico" className={inputBase} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-600 md:col-span-2">
                  Indicaciones y recomendaciones
                  <textarea
                    name="indicaciones"
                    rows="3"
                    placeholder="Recomendaciones para el paciente y tutor"
                    className={`${inputBase} min-h-[120px] resize-none`}
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Archivos adjuntos</h2>
              <p className="text-sm text-slate-500">
                Adjunta resultados de laboratorio, imágenes o documentos de apoyo en caso de ser necesario.
              </p>
              <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/60 px-6 py-10 text-sm text-sky-600">
                <span className="text-3xl">📄</span>
                <span className="font-semibold">Arrastra archivos o haz clic para seleccionar</span>
                <input type="file" multiple className="hidden" />
              </label>
            </section>

            <div className="flex flex-col gap-3 rounded-2xl bg-sky-50/80 px-5 py-4 text-sm text-sky-700 md:flex-row md:items-center md:justify-between">
              <p className="font-medium">
                Verifica la información antes de guardar. Podrás editar la evolución desde el historial del paciente.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/40"
              >
                <span aria-hidden>💾</span>
                Guardar evolución
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
