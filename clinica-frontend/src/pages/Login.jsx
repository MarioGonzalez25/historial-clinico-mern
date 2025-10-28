// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { AuthAPI } from "../api/auth";
import { useAuthStore } from "../store/auth";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import PasswordField from "../components/ui/PasswordField";
import hero from "../assets/login-hero.png";

/* ---------- AntiHalo: mezcla el borde blanco con el color del panel ---------- */
function AntiHaloImage({
  src,
  className = "",
  alt = "",
  bgColor = [215, 204, 255], // color base del panel (D7CCFF)
  softStart = 235,           // 235..255 zona de transición
}) {
  const [outSrc, setOutSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = src;

    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth, h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Pintar fondo con color del panel
      ctx.fillStyle = `rgb(${bgColor[0]},${bgColor[1]},${bgColor[2]})`;
      ctx.fillRect(0, 0, w, h);
      // Dibujar imagen
      ctx.drawImage(img, 0, 0, w, h);

      // Recolorear halos blancos hacia el color del panel
      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;
      const [br, bg, bb] = bgColor;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
        const maxc = Math.max(r, g, b);
        if (maxc >= softStart) {
          const k = (maxc - softStart) / (255 - softStart); // 0..1
          d[i]   = Math.round(r * (1 - k) + br * k);
          d[i+1] = Math.round(g * (1 - k) + bg * k);
          d[i+2] = Math.round(b * (1 - k) + bb * k);
          d[i+3] = a;
        }
      }

      // Suavizado mínimo del alpha para puntitos aislados
      const a2 = new Uint8ClampedArray(d.length / 4);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) a2[p] = d[i + 3];
      const getA = (x, y) => (x<0||y<0||x>=w||y>=h) ? 0 : a2[y*w + x];
      for (let y = 1; y < h-1; y++) {
        for (let x = 1; x < w-1; x++) {
          let m = 0;
          for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) m = Math.max(m, getA(x+dx,y+dy));
          const idx = (y*w + x)*4 + 3;
          d[idx] = Math.max(d[idx], m);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setOutSrc(canvas.toDataURL("image/png"));
    };

    img.onerror = () => setOutSrc(src);
    return () => { cancelled = true; };
  }, [src, bgColor, softStart]);

  return <img src={outSrc || src} alt={alt} className={className} decoding="async" />;
}
/* --------------------------------------------------------------------------- */

// Íconos
const UserIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/>
  </svg>
);
const LockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 8h-1V6a4 4 0 10-8 0v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V6z"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const loginOk = useAuthStore((s) => s.loginOk);
  const fetchMeIfToken = useAuthStore((s) => s.fetchMeIfToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => { fetchMeIfToken(); }, [fetchMeIfToken]);
  useEffect(() => {
    if (!user) return;
    const role = (user.role || user.rol || "").toUpperCase();
    if (role === "ADMIN") nav("/admin", { replace: true });
    else if (role === "MEDICO") nav("/medico", { replace: true });
    else if (role === "ASISTENTE") nav("/asistente", { replace: true });
    else nav("/dashboard", { replace: true });
  }, [user, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Ingresa tu usuario o correo");
    if (!pass) return toast.error("Ingresa tu contraseña");
    setLoading(true);
    try {
      const { token, user } = await AuthAPI.login(email.trim(), pass);
      loginOk({ token, user });
      toast.success(`Bienvenido, ${user?.nombre || "usuario"}`);
    } catch (err) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[100svh] px-4 py-6 sm:py-10">
      <Toaster position="top-right" />
      <div className="w-full max-w-[1100px] bg-white/95 rounded-3xl sm:rounded-[28px] shadow-magic overflow-hidden flex flex-col lg:flex-row">
        {/* Panel izquierdo */}
        <div className="relative p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-panelL to-panelR flex flex-col items-center text-center flex-1">
          <div className="text-purple-700 max-w-[90%]">
            <h1 className="font-extrabold leading-tight drop-shadow-sm text-2xl sm:text-4xl lg:text-5xl">
              Clínica Pediátrica
            </h1>
            <p className="mt-1 sm:mt-2 italic opacity-90 text-sm sm:text-lg lg:text-xl">
              Dra. Wallis Trocolí de Calderón
            </p>
          </div>

          <AntiHaloImage
            src={hero}
            alt="Ilustración"
            className="mt-6 sm:mt-8 mx-auto w-full max-w-[200px] sm:max-w-[320px] lg:max-w-[420px] object-contain select-none pointer-events-none"
            bgColor={[215, 204, 255]} // color del panel
            softStart={235}
          />

          <p className="mt-6 sm:mt-8 text-purple-900/80 font-medium text-base sm:text-lg">
            Cuidando la salud de tus pequeños ✨
          </p>

          <div className="absolute -left-10 -bottom-10 w-24 h-24 sm:w-36 sm:h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-28 h-28 sm:w-44 sm:h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Panel derecho */}
        <div className="p-6 sm:p-8 lg:p-12 bg-white flex-1">
          <div className="max-w-[460px] mx-auto">
            <h2 className="font-bold text-gray-800 text-2xl sm:text-3xl lg:text-4xl">
              ¡Bienvenido! <span className="align-middle">👋</span>
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Inicia sesión en tu cuenta</p>

            <form onSubmit={onSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
              <TextField
                label="Usuario"
                placeholder="Ingresa tu usuario"
                icon={UserIcon}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordField
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                icon={LockIcon}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />

              <div className="text-right -mt-1 sm:-mt-2">
                <Link to="/forgot" className="text-sm text-primary-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar Sesión ➜"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
