import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Forgot from "./pages/Forgot";
import Dashboard from "./pages/Dashboard";
import Reset from "./pages/Reset";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import NuevoPaciente from "./pages/pacientes/NuevoPaciente";
import EditarPaciente from "./pages/pacientes/EditarPaciente";
import ListaPacientes from "./pages/pacientes/ListaPacientes";
import NuevaCita from "./pages/citas/NuevaCita";
import ConsultarHistorial from "./pages/historial/ConsultarHistorial";
import RegistrarEvolucion from "./pages/historial/RegistrarEvolucion";
import Usuarios from "./pages/usuarios/Usuarios";
import Reportes from "./pages/reportes/Reportes";
import NotasRapidas from "./pages/notas/NotasRapidas";
import ListaCitas from "./pages/citas/ListaCitas";
import Configuracion from "./pages/configuracion/Configuracion";

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
          path="/pacientes"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO", "ASISTENTE"]}>
              <ListaPacientes />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/pacientes/nuevo"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO", "ASISTENTE"]}>
              <NuevoPaciente />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/pacientes/:id/editar"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO"]}>
              <EditarPaciente />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/citas/nueva"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO", "ASISTENTE"]}>
              <NuevaCita />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/citas"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO", "ASISTENTE"]}>
              <ListaCitas />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/historial/consultar"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO", "ASISTENTE"]}>
              <ConsultarHistorial />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/historial/evolucion"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO"]}>
              <RegistrarEvolucion />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/notas/rapidas"
          element={(
            <ProtectedRoute roles={["MEDICO"]}>
              <NotasRapidas />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/usuarios"
          element={(
            <ProtectedRoute roles={["ADMIN"]}>
              <Usuarios />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/reportes"
          element={(
            <ProtectedRoute roles={["ADMIN", "MEDICO"]}>
              <Reportes />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/configuracion"
          element={(
            <ProtectedRoute roles={["ADMIN"]}>
              <Configuracion />
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
