import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { soporteApi } from "../../api/soporte";

const initialTicket = {
  asunto: "",
  descripcion: "",
  prioridad: "MEDIA",
};

export default function Soporte() {
  const [ticket, setTicket] = useState(initialTicket);
  const [enviando, setEnviando] = useState(false);
  const [ultimoTicket, setUltimoTicket] = useState(null);

  const onChange = (event) => {
    const { name, value } = event.target;
    setTicket((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setEnviando(true);
      const payload = {
        asunto: ticket.asunto,
        descripcion: ticket.descripcion,
        prioridad: ticket.prioridad,
      };
      const nuevo = await soporteApi.crearTicket(payload);
      setTicket(initialTicket);
      setUltimoTicket(nuevo);
      toast.success(`Ticket ${nuevo.folio} enviado correctamente`);
    } catch (err) {
      console.error("[soporte] submit", err);
      const mensaje = err?.response?.data?.error || "No se pudo enviar la solicitud";
      toast.error(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ff] via-[#eef2ff] to-[#fdf4ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 lg:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-[0_30px_90px_-60px_rgba(79,70,229,0.55)] sm:p-12">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Ayuda</p>
            <h1 className="text-3xl font-semibold text-slate-900">Centro de soporte</h1>
            <p className="text-sm text-slate-500">
              Reporta incidencias operativas o solicita asistencia al equipo administrativo de la clínica.
            </p>
          </header>

          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="asunto">
                  Asunto
                </label>
                <input
                  id="asunto"
                  name="asunto"
                  value={ticket.asunto}
                  onChange={onChange}
                  required
                  placeholder="Ej. Problema con agenda de hoy"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="descripcion">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={ticket.descripcion}
                  onChange={onChange}
                  required
                  rows={6}
                  placeholder="Detalla lo sucedido para brindarte ayuda más rápido."
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600" htmlFor="prioridad">
                  Prioridad
                </label>
                <select
                  id="prioridad"
                  name="prioridad"
                  value={ticket.prioridad}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/45 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {enviando ? "Enviando…" : "Enviar solicitud"}
              </button>

              {ultimoTicket && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-900 shadow-sm">
                  <p className="font-semibold text-indigo-700">Tu solicitud fue registrada</p>
                  <p className="mt-1 text-xs text-indigo-600">
                    Folio <span className="font-mono font-semibold">{ultimoTicket.folio}</span> · Prioridad {ultimoTicket.prioridad}
                  </p>
                  <p className="mt-3 text-xs text-indigo-500">
                    El equipo recibirá una notificación inmediata y te contactará al correo asociado a tu cuenta.
                  </p>
                </div>
              )}
            </form>

            <aside className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Atajos rápidos</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <span className="font-semibold text-slate-700">Teléfono de emergencias:</span> 5555-1020
                </li>
                <li>
                  <span className="font-semibold text-slate-700">Correo de soporte:</span> soporte@clinicadrawallis.com
                </li>
                <li>
                  <span className="font-semibold text-slate-700">Horario de atención:</span> Lunes a viernes de 8:00 a 18:00
                </li>
              </ul>
              <div className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-800">Consejos</p>
                <p className="mt-2 text-xs text-slate-500">
                  Adjunta capturas o el identificador del paciente si el incidente está relacionado con un registro específico.
                </p>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}
