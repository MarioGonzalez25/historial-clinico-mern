import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Forgot from "./pages/Forgot";
import Dashboard from "./pages/Dashboard";
import Reset from "./pages/Reset"; // ⬅️ importa la página de reset

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        {/* Ambos paths apuntan al mismo componente de reset */}
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset-password" element={<Reset />} />

        {/* App */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
