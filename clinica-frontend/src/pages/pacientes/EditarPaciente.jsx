import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { PacientesAPI } from "../../api/pacientes";
import PacienteForm from "../../components/pacientes/PacienteForm";

export default function EditarPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        setLoading(true);
        const data = await PacientesAPI.get(id);
        setPaciente(data);
      } catch (err) {
        console.error("[pacientes] detail", err);
        const status = err?.response?.status;
        if (status === 404) {
          toast.error("Paciente no encontrado");
          navigate("/pacientes", { replace: true });
        } else {
          const message = err?.response?.data?.error || err?.message || "No se pudo cargar el paciente";
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPaciente();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      await PacientesAPI.update(id, payload);
      toast.success("Paciente actualizado correctamente");
      navigate("/pacientes");
    } catch (err) {
      console.error("[pacientes] update", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo actualizar el paciente";
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
            <h1 className="text-3xl font-semibold text-slate-900">Editar paciente</h1>
            <p className="text-sm text-slate-500">
              Actualiza la información general, documentos y antecedentes del paciente para mantener el expediente completo.
            </p>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 text-sm text-indigo-700">
              Cargando información del paciente…
            </div>
          ) : (
            <PacienteForm
              initialValues={paciente}
              submitting={saving}
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              submitLabel={saving ? "Actualizando…" : "Guardar cambios"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
