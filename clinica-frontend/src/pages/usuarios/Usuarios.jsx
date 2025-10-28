import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UsersAPI } from "../../api/users";
import { AuthAPI } from "../../api/auth";

const inputClasses =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100";

const roleLabels = {
  ADMIN: "Administrador",
  MEDICO: "Médico",
  ASISTENTE: "Asistente",
};

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "ASISTENTE" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UsersAPI.list();
      setUsers(response.users || []);
    } catch (err) {
      console.error("[usuarios] list", err);
      const message = err?.response?.data?.error || err?.message || "No se pudieron cargar los usuarios";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createUser = async (event) => {
    event.preventDefault();
    if (!form.nombre.trim()) return toast.error("Ingresa el nombre completo");
    if (!form.email.trim()) return toast.error("Ingresa el correo electrónico");
    if (!form.password || form.password.length < 8) return toast.error("La contraseña debe tener al menos 8 caracteres");
    try {
      setCreating(true);
      await AuthAPI.register({ nombre: form.nombre.trim(), email: form.email.trim(), password: form.password, rol: form.rol });
      toast.success("Usuario creado correctamente");
      setForm({ nombre: "", email: "", password: "", rol: "ASISTENTE" });
      fetchUsers();
    } catch (err) {
      console.error("[usuarios] create", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo crear el usuario";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const enrichedUsers = useMemo(
    () =>
      users.map((user) => ({
        id: user._id || user.id,
        nombre: user.nombre,
        email: user.email,
        rol: roleLabels[user.rol] || user.rol,
        estado: "Activo",
      })),
    [users]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1e5ff] via-[#eef2ff] to-[#fef3ff]">
      <Toaster position="top-right" />
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
          </div>

          <form onSubmit={createUser} className="mt-8 grid gap-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-5 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-base font-semibold text-slate-800">Crear nuevo usuario</h2>
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Nombre completo
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej. María González"
                className={inputClasses}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Correo electrónico
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="usuario@clinica.com"
                className={inputClasses}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Contraseña
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Min. 8 caracteres"
                className={inputClasses}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-600">
              Rol
              <select name="rol" value={form.rol} onChange={onChange} className={`${inputClasses} text-slate-700`}>
                <option value="ASISTENTE">Asistente</option>
                <option value="MEDICO">Médico</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creating ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </form>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">Cargando usuarios…</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Rol</th>
                    <th className="px-6 py-4 font-semibold">Correo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70 text-slate-600">
                  {enrichedUsers.map((usuario) => (
                    <tr key={usuario.id} className="transition hover:bg-violet-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{usuario.nombre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                          <span aria-hidden>●</span>
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4">{usuario.email}</td>
                    </tr>
                  ))}
                  {enrichedUsers.length === 0 && !loading && (
                    <tr>
                      <td className="px-6 py-4 text-center text-sm text-slate-500" colSpan={3}>
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
