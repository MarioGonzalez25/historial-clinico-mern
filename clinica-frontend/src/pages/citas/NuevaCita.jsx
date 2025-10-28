const fieldClasses =
  "block w-full rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100/70 transition";

export default function NuevaCita() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1e5ff] via-[#f0f9ff] to-[#fef2ff]">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_25px_80px_-50px_rgba(79,70,229,0.6)] sm:p-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-500/80">Agenda clínica</p>
            <h1 className="text-3xl font-semibold text-slate-900">Agendar nueva cita</h1>
            <p className="text-sm text-slate-500">
              Registra rápidamente una nueva cita indicando el paciente y la fecha de atención. Podrás asignar el médico y
              consultorio en pasos posteriores.
            </p>
          </div>

          <form className="mt-10 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Paciente
                <input type="text" name="paciente" placeholder="Nombre del paciente" className={fieldClasses} />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Fecha de la cita
                <input type="date" name="fecha" className={fieldClasses} />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Motivo (opcional)
                <input
                  type="text"
                  name="motivo"
                  placeholder="Control, seguimiento, vacunación..."
                  className={fieldClasses}
                />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-600">
                Hora sugerida
                <input type="time" name="hora" className={fieldClasses} />
              </label>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-violet-50/80 px-5 py-4 text-sm text-violet-700 md:flex-row md:items-center md:justify-between">
              <p className="font-medium">
                Recuerda confirmar la disponibilidad del especialista antes de guardar la cita para evitar cruces en la agenda.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/40"
              >
                Guardar cita
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
