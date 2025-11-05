import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const initialSettings = {
  recordatorios: true,
  dobleFactor: false,
  modoSeguro: true,
};

export default function Configuracion() {
  const [settings, setSettings] = useState(initialSettings);
  const [guardando, setGuardando] = useState(false);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setGuardando(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Configuración guardada correctamente");
    } catch (err) {
      console.error("[configuracion] save", err);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ff] via-[#eef2ff] to-[#fef6ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 lg:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-60px_rgba(79,70,229,0.55)] sm:p-12">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-500/80">Preferencias</p>
            <h1 className="text-3xl font-semibold text-slate-900">Configuración del sistema</h1>
            <p className="text-sm text-slate-500">
              Ajusta parámetros globales relacionados con seguridad, notificaciones y flujo de trabajo de la clínica.
            </p>
          </header>

          <section className="mt-10 space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Notificaciones</h2>
              <p className="mt-1 text-sm text-slate-500">
                Controla los recordatorios automáticos enviados a tutores y personal médico.
              </p>
              <div className="mt-5 space-y-4">
                <label className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                  <span>Recordatorios de citas</span>
                  <input
                    type="checkbox"
                    checked={settings.recordatorios}
                    onChange={() => toggleSetting("recordatorios")}
                    className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </label>
                <label className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                  <span>Modo seguro para historiales clínicos</span>
                  <input
                    type="checkbox"
                    checked={settings.modoSeguro}
                    onChange={() => toggleSetting("modoSeguro")}
                    className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Seguridad</h2>
              <p className="mt-1 text-sm text-slate-500">
                Refuerza el acceso al sistema aplicando políticas de autenticación más estrictas.
              </p>
              <div className="mt-5 space-y-4">
                <label className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                  <span>Requerir doble factor para administradores</span>
                  <input
                    type="checkbox"
                    checked={settings.dobleFactor}
                    onChange={() => toggleSetting("dobleFactor")}
                    className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </label>
                <div className="rounded-xl bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
                  <p className="font-semibold text-slate-800">Contraseñas</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Obliga a renovar contraseñas cada 90 días y habilita alertas cuando existan intentos fallidos consecutivos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={guardando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/45 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
