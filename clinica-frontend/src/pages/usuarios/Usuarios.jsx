const users = [
  { nombre: "María González", rol: "Médico", estado: "Activo" },
  { nombre: "Luis Herrera", rol: "Asistente", estado: "Activo" },
  { nombre: "Paola Méndez", rol: "Médico", estado: "En revisión" },
  { nombre: "Carla Ruiz", rol: "Asistente", estado: "Suspendido" },
];

export default function Usuarios() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1e5ff] via-[#eef2ff] to-[#fef3ff]">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-white p-6 text-gray-800 shadow-[0_25px_80px_-50px_rgba(79,70,229,0.55)] sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-500/80">Administración</p>
              <h1 className="text-3xl font-semibold text-slate-900">Gestión de usuarios</h1>
              <p className="mt-2 text-sm text-slate-500">
                Consulta el estado de las cuentas del personal, crea nuevos accesos y controla los permisos activos en la
                clínica.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/40"
            >
              Nuevo usuario
            </button>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-slate-600">
                {users.map((usuario) => (
                  <tr key={usuario.nombre} className="transition hover:bg-violet-50/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{usuario.nombre}</p>
                      <p className="text-xs text-slate-400">usuario@clinica.com</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                        <span aria-hidden>●</span>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-emerald-600">
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="rounded-lg border border-violet-100 px-3 py-1 text-xs font-semibold text-violet-600 hover:border-violet-200">
                          Editar
                        </button>
                        <button type="button" className="rounded-lg border border-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:border-rose-200">
                          Suspender
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-2xl bg-violet-50/80 p-5 text-sm text-violet-700">
            Recuerda revisar periódicamente los accesos del personal y revocar permisos cuando un colaborador deje de formar
            parte del equipo.
          </div>
        </div>
      </div>
    </div>
  );
}
