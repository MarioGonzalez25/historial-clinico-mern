import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Forgot from "./pages/Forgot";
import Dashboard from "./pages/Dashboard";
import Reset from "./pages/Reset";
import ProtectedRoute from "./components/layout/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset-password" element={<Reset />} />

        {/* App */}
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin"
          element={(
            <ProtectedRoute allowed={["ADMIN"]}>
              <Dashboard forcedRole="ADMIN" />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/medico"
          element={(
            <ProtectedRoute allowed={["MEDICO"]}>
              <Dashboard forcedRole="MEDICO" />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/asistente"
          element={(
            <ProtectedRoute allowed={["ASISTENTE"]}>
              <Dashboard forcedRole="ASISTENTE" />
            </ProtectedRoute>
          )}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
