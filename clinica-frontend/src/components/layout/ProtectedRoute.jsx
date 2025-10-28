import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

export default function ProtectedRoute({ children, allowed = [], roles = [] }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const loadingMe = useAuthStore((s) => s.loadingMe);
  const fetchMeIfToken = useAuthStore((s) => s.fetchMeIfToken);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (token && !user && !loadingMe) {
      fetchMeIfToken();
    }
  }, [token, user, loadingMe, fetchMeIfToken]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (loadingMe && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900/90 text-white">
        <div className="rounded-2xl bg-white/10 px-8 py-6 text-sm backdrop-blur">
          Recuperando tu sesión…
        </div>
      </div>
    );
  }

  if (!loadingMe && token && !user) {
    logout();
    return <Navigate to="/" replace />;
  }

  const allowedRoles = roles.length > 0 ? roles : allowed;

  const role = (user?.rol || user?.role || "").toUpperCase();
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
