import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";
import PacienteForm from "../../components/pacientes/PacienteForm";

export default function NuevoPaciente() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      await PacientesAPI.create(payload);
      toast.success("Paciente registrado correctamente");
      navigate("/pacientes");
    } catch (err) {
      console.error("[pacientes] create", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo registrar el paciente";
      toast.error(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5ff] via-[#eef2ff] to-[#fef3ff]">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_25px_80px_-50px_rgba(99,102,241,0.55)] sm:p-8 lg:p-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500/80">Registro clínico</p>
            <h1 className="text-3xl font-semibold text-slate-900">Registrar nuevo paciente</h1>
            <p className="text-sm text-slate-500">
              Completa la ficha inicial del paciente junto a los datos del tutor responsable. Podrás actualizar la ficha desde el
              panel de pacientes.
            </p>
          </div>

          <PacienteForm
            submitting={saving}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            submitLabel={saving ? "Guardando…" : "Registrar paciente"}
          />
        </div>
      </div>
    </div>
  );
}
