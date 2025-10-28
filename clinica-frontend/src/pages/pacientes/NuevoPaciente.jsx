const inputBase =
  "block w-full rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100/70 transition";

export default function NuevoPaciente() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5ff] via-[#eef2ff] to-[#fef3ff]">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_25px_80px_-50px_rgba(99,102,241,0.55)] sm:p-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Registro clínico</p>
            <h1 className="text-3xl font-semibold text-slate-900">Registrar nuevo paciente</h1>
            <p className="text-sm text-slate-500">
              Completa la ficha inicial del paciente junto a los datos del tutor responsable. Podrás agregar más información en
              la sección de historial clínico.
            </p>
          </div>

          <form className="mt-10 space-y-10">
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Datos del paciente</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Nombre completo
                  <input type="text" name="nombre" placeholder="Ej. Ana María López" className={inputBase} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Edad
                  <input type="number" name="edad" min="0" placeholder="Ej. 7" className={inputBase} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Documento (opcional)
                  <input type="text" name="documento" placeholder="CURP / Pasaporte" className={inputBase} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Dirección (opcional)
                  <input type="text" name="direccion" placeholder="Colonia, ciudad" className={inputBase} />
                </label>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Información del tutor</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Tutor responsable
                  <input type="text" name="tutor" placeholder="Nombre del tutor" className={inputBase} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Parentesco
                  <input type="text" name="parentesco" placeholder="Madre, padre, tutor legal…" className={inputBase} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Teléfono de contacto
                  <input type="tel" name="telefono" placeholder="Ej. +52 555 123 4567" className={inputBase} />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-600">
                  Correo electrónico
                  <input type="email" name="correo" placeholder="tutor@dominio.com" className={inputBase} />
                </label>
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-2xl bg-indigo-50/80 px-5 py-4 text-sm text-indigo-700 md:flex-row md:items-center md:justify-between">
              <p className="font-medium">
                Verifica los datos capturados antes de guardar. Podrás actualizar la ficha en cualquier momento desde el panel
                de pacientes.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40"
              >
                Guardar paciente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
