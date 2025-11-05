import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UsersAPI } from "../../api/users";
import { useAuthStore } from "../../store/auth";

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
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", email: "", rol: "ASISTENTE", password: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const currentUserId = useAuthStore((state) => state.user?.id ?? state.user?._id ?? null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UsersAPI.list();
      const normalized = (response.users || []).map((user) => ({
        id: user._id || user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      setUsers(normalized);
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
      await UsersAPI.create({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
      });
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
        ...user,
        rolLabel: roleLabels[user.rol] || user.rol,
      })),
    [users]
  );

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({ nombre: user.nombre, email: user.email, rol: user.rol, password: "" });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm({ nombre: "", email: "", rol: "ASISTENTE", password: "" });
  };

  const onEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editingUser) return;
    if (!editForm.nombre.trim()) return toast.error("Ingresa el nombre completo");
    if (!editForm.email.trim()) return toast.error("Ingresa el correo electrónico");

    const payload = {
      nombre: editForm.nombre.trim(),
      email: editForm.email.trim(),
      rol: editForm.rol,
    };
    if (editForm.password) {
      if (editForm.password.length < 8) {
        return toast.error("La contraseña debe tener al menos 8 caracteres");
      }
      payload.password = editForm.password;
    }

    try {
      setSavingEdit(true);
      await UsersAPI.update(editingUser.id, payload);
      toast.success("Usuario actualizado correctamente");
      closeEdit();
      fetchUsers();
    } catch (err) {
      console.error("[usuarios] update", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo actualizar el usuario";
      toast.error(message);
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(`¿Eliminar a ${user.nombre}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    try {
      setDeletingId(user.id);
      await UsersAPI.remove(user.id);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch (err) {
      console.error("[usuarios] delete", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo eliminar el usuario";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

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
              <p className="text-xs font-normal text-slate-400">Incluye mayúsculas, minúsculas, números y símbolos.</p>
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
                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
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
                          {usuario.rolLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">{usuario.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(usuario)}
                            className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-600 transition hover:border-violet-300 hover:bg-violet-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(usuario)}
                            disabled={deletingId === usuario.id || usuario.id === currentUserId}
                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {usuario.id === currentUserId ? "No disponible" : deletingId === usuario.id ? "Eliminando…" : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {enrichedUsers.length === 0 && !loading && (
                    <tr>
                      <td className="px-6 py-4 text-center text-sm text-slate-500" colSpan={4}>
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

      {editingUser && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Editar usuario</h3>
                <p className="text-sm text-slate-500">Actualiza la información del colaborador seleccionado.</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="sr-only">Cerrar</span>×
              </button>
            </div>

            <form onSubmit={submitEdit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-600">
                Nombre completo
                <input
                  type="text"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={onEditChange}
                  className={`${inputClasses} mt-2`}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={onEditChange}
                  className={`${inputClasses} mt-2`}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Rol
                <select name="rol" value={editForm.rol} onChange={onEditChange} className={`${inputClasses} mt-2 text-slate-700`}>
                  <option value="ASISTENTE">Asistente</option>
                  <option value="MEDICO">Médico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Nueva contraseña (opcional)
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={onEditChange}
                  placeholder="Dejar en blanco para mantener la actual"
                  className={`${inputClasses} mt-2`}
                />
                <p className="mt-1 text-xs font-normal text-slate-400">Debe contener mayúsculas, minúsculas, números y símbolos.</p>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingEdit ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
