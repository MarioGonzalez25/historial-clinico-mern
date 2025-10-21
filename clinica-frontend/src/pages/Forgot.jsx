import { useState } from "react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import { AuthAPI } from "../api/auth";

const MailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/>
  </svg>
);

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Ingresa un correo válido");
    setSending(true);
    try {
      await AuthAPI.forgot(email.trim());
      toast.success("Si el correo existe, te enviamos el enlace ✉️");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Error al enviar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-magic p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Recuperar contraseña</h1>
        <p className="text-gray-500 mt-1">Ingresa tu correo y te enviaremos un enlace.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <TextField
            label="Correo"
            placeholder="tucorreo@ejemplo.com"
            type="email"
            icon={MailIcon}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={sending}>
            {sending ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>

        <div className="mt-6">
          <Link to="/login" className="text-sm text-primary-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
