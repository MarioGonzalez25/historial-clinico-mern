// src/pages/Reset.jsx
import { useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Button from "../components/ui/Button";
import PasswordField from "../components/ui/PasswordField";
import { AuthAPI } from "../api/auth";

// Reglas
const hasMinLen = (s) => s.length >= 8;
const hasUpper  = (s) => /[A-Z]/.test(s);
const hasSymbol = (s) => /[^A-Za-z0-9]/.test(s);

// Devuelve errores faltantes
function validatePasswordAll(p) {
  const errs = [];
  if (!hasMinLen(p)) errs.push("8+ caracteres");
  if (!hasUpper(p))  errs.push("1 mayúscula");
  if (!hasSymbol(p)) errs.push("1 símbolo");
  return errs; // vacío = OK
}

function PasswordHints({ value = "" }) {
  const items = [
    { ok: hasMinLen(value), label: "Al menos 8 caracteres" },
    { ok: hasUpper(value),  label: "Al menos 1 mayúscula (A–Z)" },
    { ok: hasSymbol(value), label: "Al menos 1 símbolo (p.ej. ! @ # $ %)" },
  ];
  return (
    <ul className="mt-2 space-y-1">
      {items.map((it, i) => (
        <li key={i} className={`text-sm flex items-center gap-2 ${it.ok ? "text-green-600" : "text-gray-500"}`}>
          <span className={`inline-block w-4 h-4 rounded-full ${it.ok ? "bg-green-500" : "bg-gray-300"}`} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export default function Reset() {
  const nav = useNavigate();
  const { search } = useLocation();
  const token = useMemo(() => new URLSearchParams(search).get("token") || "", [search]);

  const [pass, setPass]   = useState("");
  const [pass2, setPass2] = useState("");
  const [saving, setSaving] = useState(false);

  const errs = validatePasswordAll(pass);
  const canSubmit = token && errs.length === 0 && pass === pass2 && !saving;

  async function onSubmit(e) {
    e.preventDefault();
    if (!token) return toast.error("Token inválido o ausente. Solicita un nuevo enlace.");

    // Si algo del front falta, mostramos un único aviso conciso
    if (errs.length) return toast.error(`La contraseña debe tener: ${errs.join(", ")}`);
    if (pass !== pass2) return toast.error("Las contraseñas no coinciden.");

    setSaving(true);
    try {
      await AuthAPI.reset(token, pass); // envía newPassword/confirmPassword
      toast.success("Contraseña actualizada ✅");
      setTimeout(() => nav("/login", { replace: true }), 700);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.msg ||
        err?.message ||
        "No se pudo actualizar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-2xl bg-white/95 rounded-3xl shadow-magic p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Restablecer contraseña
        </h1>
        <p className="text-gray-500 mt-2">Ingresa y confirma tu nueva contraseña.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <PasswordField
              label="Nueva contraseña"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
            <PasswordHints value={pass} />
          </div>

          <PasswordField
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
          />

          <Button type="submit" disabled={!canSubmit}>
            {saving ? "Guardando…" : "Guardar contraseña"}
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
