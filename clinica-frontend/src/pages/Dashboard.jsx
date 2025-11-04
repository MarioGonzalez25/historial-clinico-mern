import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import RoleDashboard from "../components/dashboard/RoleDashboard";
import { useAuthStore } from "../store/auth";
import { DashboardAPI } from "../api/dashboard";

const numberFormatter = new Intl.NumberFormat("es-GT");

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return numberFormatter.format(value);
}

const STATUS_META = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
  CONFIRMADA: { label: "Confirmada", className: "bg-emerald-100 text-emerald-600" },
  ATENDIDA: { label: "Atendida", className: "bg-slate-100 text-slate-600" },
  CANCELADA: { label: "Cancelada", className: "bg-rose-100 text-rose-500" },
  NO_ASISTIO: { label: "No asistió", className: "bg-rose-100 text-rose-500" },
};

function buildSchedule(agenda = []) {
  return agenda.map((item) => {
    const start = item?.inicio ? new Date(item.inicio) : null;
    const period = start && start.getHours() < 12 ? "AM" : "PM";
    const time = start
      ? start.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })
      : "--:--";
    const statusMeta = STATUS_META[item.estado] || { label: item.estado || "Programada", className: "bg-slate-100 text-slate-600" };

    return {
      timePeriod: period || "--",
      time,
      patient: item?.paciente?.nombre || "Paciente por asignar",
      description:
        item?.motivo ||
        (item?.doctor?.nombre ? `Atención con ${item.doctor.nombre}` : "Consulta programada"),
      status: statusMeta.label,
      statusClass: statusMeta.className,
    };
  });
}

const DASHBOARD_HOME = {
  ADMIN: "/admin",
  MEDICO: "/medico",
  ASISTENTE: "/asistente",
};

const ROLE_BASE = {
  ADMIN: {
    roleLabel: "Administrador",
    subtitle: "Panel general del sistema",
    description: "Supervisa usuarios, pacientes, agendas y métricas clave de la clínica en un solo lugar.",
    sidebar: {
      gradient: "bg-gradient-to-br from-[#4c1d95] via-[#7c3aed] to-[#db2777]",
      note: "Acceso total para configurar usuarios, revisar reportes y ajustar la operación diaria de la clínica.",
    },
    navItems: [
      {
        key: "home",
        label: "Inicio",
        icon: "🏠",
        to: DASHBOARD_HOME.ADMIN,
        match: (pathname) => ["/dashboard", DASHBOARD_HOME.ADMIN].includes(pathname),
      },
      {
        key: "patients",
        label: "Pacientes",
        icon: "🧒",
        to: "/pacientes",
        match: (pathname) => pathname.startsWith("/pacientes"),
      },
      {
        key: "appointments",
        label: "Citas",
        icon: "📅",
        to: "/citas",
        match: (pathname) => pathname.startsWith("/citas"),
      },
      {
        key: "history",
        label: "Historial clínico",
        icon: "📋",
        to: "/historial/consultar",
        match: (pathname) => pathname.startsWith("/historial"),
      },
      {
        key: "users",
        label: "Usuarios",
        icon: "🧑‍⚕️",
        to: "/usuarios",
        match: (pathname) => pathname.startsWith("/usuarios"),
      },
      {
        key: "reports",
        label: "Reportes",
        icon: "📊",
        to: "/reportes",
        match: (pathname) => pathname.startsWith("/reportes"),
      },
      {
        key: "settings",
        label: "Configuración",
        icon: "⚙️",
        to: "/configuracion",
        match: (pathname) => pathname.startsWith("/configuracion"),
      },
    ],
    stats: [
      {
        key: "pacientes",
        label: "Pacientes activos",
        icon: "👨‍👩‍👧",
        iconClass: "bg-violet-100 text-violet-600",
        trendBuilder: (totals) => `+${formatNumber(totals.nuevosPacientes7d || 0)} últimos 7 días`,
      },
      {
        key: "citasHoy",
        label: "Citas hoy",
        icon: "📅",
        iconClass: "bg-rose-100 text-rose-600",
        trendBuilder: (totals) => `${formatNumber(totals.citasPendientesHoy || 0)} por atender`,
      },
      {
        key: "citasSemana",
        label: "Citas esta semana",
        icon: "🗓️",
        iconClass: "bg-indigo-100 text-indigo-600",
        trend: "Agenda global",
      },
      {
        key: "usuarios",
        label: "Usuarios activos",
        icon: "🧑‍⚕️",
        iconClass: "bg-emerald-100 text-emerald-600",
        trendBuilder: (totals) =>
          `Médicos ${formatNumber(totals.medicos || 0)} · Asistentes ${formatNumber(totals.asistentes || 0)}`,
      },
    ],
    quickActions: [
      {
        icon: "➕",
        iconClass: "bg-violet-100 text-violet-600",
        title: "Nuevo paciente",
        subtitle: "Registrar ficha y datos del tutor",
        wrapperClass: "hover:bg-violet-50/80",
        to: "/pacientes/nuevo",
      },
      {
        icon: "📅",
        iconClass: "bg-rose-100 text-rose-500",
        title: "Nueva cita",
        subtitle: "Asignar médico y consultorio",
        wrapperClass: "hover:bg-rose-50/80",
        to: "/citas/nueva",
      },
      {
        icon: "🧑‍⚕️",
        iconClass: "bg-indigo-100 text-indigo-600",
        title: "Gestionar usuarios",
        subtitle: "Crear o suspender cuentas",
        wrapperClass: "hover:bg-indigo-50/80",
        to: "/usuarios",
      },
      {
        icon: "📊",
        iconClass: "bg-emerald-100 text-emerald-600",
        title: "Ver reportes",
        subtitle: "Indicadores de servicio",
        wrapperClass: "hover:bg-emerald-50/80",
        to: "/reportes",
      },
    ],
    permissions: {
      allowed: [
        "Usuarios: crear, editar y eliminar médicos y asistentes",
        "Pacientes: acceso total para registrar y depurar",
        "Citas: control completo de la agenda",
        "Historial clínico: ver y editar notas",
        "Configuración global y reportes",
      ],
      limits: ["Acceso completo. Usa con responsabilidad."],
    },
    reminderBuilder: ({ proximas }) => {
      if (!proximas || proximas.length === 0) {
        return {
          title: "Recordatorio",
          headline: "Agenda al día",
          body: "Programa revisiones periódicas para mantener los indicadores de servicio en verde.",
        };
      }
      const next = proximas[0];
      const start = next.inicio ? new Date(next.inicio) : null;
      const readable = start
        ? start.toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })
        : "Próximamente";
      const status = STATUS_META[next.estado]?.label || next.estado || "Programada";
      return {
        title: "Próxima cita",
        headline: `${next?.paciente?.nombre || "Paciente"} · ${readable}`,
        body: `${status}${next?.motivo ? ` · ${next.motivo}` : ""}`,
      };
    },
    accent: {
      badge: "bg-gradient-to-r from-violet-100/90 to-rose-100/80 text-violet-700",
      badgeIcon: "⭐",
      permissionsAllowed: { bullet: "bg-violet-500" },
      permissionsLimit: { bullet: "bg-rose-400" },
      reminder: "bg-gradient-to-br from-violet-100 to-rose-100 border-violet-200/60",
    },
    scheduleAction: { title: "Ver agenda completa", to: "/citas" },
  },
  MEDICO: {
    roleLabel: "Médico",
    subtitle: "Resumen de tu consulta",
    description: "Gestiona a tus pacientes activos, programa citas y mantén actualizado el historial clínico.",
    sidebar: {
      gradient: "bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#22d3ee]",
      note: "Monitorea tu lista de pacientes, consulta sus historiales y mantén al día la agenda diaria.",
    },
    navItems: [
      {
        key: "home",
        label: "Inicio",
        icon: "🏠",
        to: DASHBOARD_HOME.MEDICO,
        match: (pathname) => ["/dashboard", DASHBOARD_HOME.MEDICO].includes(pathname),
      },
      {
        key: "patients",
        label: "Mis pacientes",
        icon: "🩺",
        to: "/pacientes?mis=1",
        match: (pathname) => pathname.startsWith("/pacientes"),
      },
      {
        key: "appointments",
        label: "Mis citas",
        icon: "🗓️",
        to: "/citas?mis=1",
        match: (pathname) => pathname.startsWith("/citas"),
      },
      {
        key: "history",
        label: "Historial clínico",
        icon: "📚",
        to: "/historial/consultar",
        match: (pathname) => pathname.startsWith("/historial"),
      },
      {
        key: "reports",
        label: "Reportes",
        icon: "📈",
        to: "/reportes",
        match: (pathname) => pathname.startsWith("/reportes"),
      },
    ],
    stats: [
      {
        key: "citasHoy",
        label: "Citas hoy",
        icon: "⏰",
        iconClass: "bg-cyan-100 text-cyan-600",
        trendBuilder: (totals) => `${formatNumber(totals.citasPendientesHoy || 0)} pendientes`,
      },
      {
        key: "citasSemana",
        label: "Agenda semanal",
        icon: "🗓️",
        iconClass: "bg-indigo-100 text-indigo-600",
        trend: "Incluye teleconsultas",
      },
      {
        key: "evolucionesSemana",
        label: "Evoluciones registradas",
        icon: "📝",
        iconClass: "bg-indigo-100 text-indigo-600",
        trend: "Semana actual",
      },
      {
        key: "nuevosPacientes7d",
        label: "Pacientes nuevos",
        icon: "🩺",
        iconClass: "bg-sky-100 text-sky-600",
        trend: "Últimos 7 días",
      },
    ],
    quickActions: [
      {
        icon: "🩺",
        iconClass: "bg-sky-100 text-sky-600",
        title: "Registrar evolución",
        subtitle: "Actualiza el historial clínico",
        wrapperClass: "hover:bg-sky-50/80",
        to: "/historial/evolucion",
      },
      {
        icon: "➕",
        iconClass: "bg-cyan-100 text-cyan-600",
        title: "Nuevo paciente",
        subtitle: "Carga datos básicos y antecedentes",
        wrapperClass: "hover:bg-cyan-50/80",
        to: "/pacientes/nuevo",
      },
      {
        icon: "🗓️",
        iconClass: "bg-indigo-100 text-indigo-600",
        title: "Programar cita",
        subtitle: "Coordina horarios disponibles",
        wrapperClass: "hover:bg-indigo-50/80",
        to: "/citas/nueva",
      },
      {
        icon: "📄",
        iconClass: "bg-emerald-100 text-emerald-600",
        title: "Notas rápidas",
        subtitle: "Checklist preconsulta",
        wrapperClass: "hover:bg-emerald-50/80",
        to: "/notas/rapidas",
      },
    ],
    permissions: {
      allowed: [
        "Pacientes: crear, editar y eliminar",
        "Citas: gestionar tu agenda completa",
        "Historial clínico: ver y editar",
        "Reportes clínicos de tus pacientes",
      ],
      limits: [
        "No puede administrar usuarios",
        "Sin acceso a configuraciones globales",
      ],
    },
    reminderBuilder: ({ proximas }) => {
      if (!proximas || proximas.length === 0) {
        return {
          title: "Consejo",
          headline: "Revisa las notas pre consulta",
          body: "Dedica unos minutos antes de cada cita para repasar antecedentes y alergias registrados.",
        };
      }
      const next = proximas[0];
      const start = next.inicio ? new Date(next.inicio) : null;
      const readable = start
        ? start.toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })
        : "Próximamente";
      const status = STATUS_META[next.estado]?.label || next.estado || "Programada";
      return {
        title: "Próxima atención",
        headline: `${next?.paciente?.nombre || "Paciente"} · ${readable}`,
        body: `${status}${next?.motivo ? ` · ${next.motivo}` : ""}`,
      };
    },
    accent: {
      badge: "bg-gradient-to-r from-sky-100/90 to-cyan-100/90 text-sky-700",
      badgeIcon: "🩺",
      permissionsAllowed: { bullet: "bg-sky-500" },
      permissionsLimit: { bullet: "bg-slate-400" },
      reminder: "bg-gradient-to-br from-sky-100 to-cyan-100 border-sky-200/60",
    },
    scheduleAction: { title: "Ver agenda completa", to: "/citas" },
  },
  ASISTENTE: {
    roleLabel: "Asistente",
    subtitle: "Organiza la operación diaria",
    description: "Registra pacientes, coordina la agenda y apoya al equipo médico con información actualizada.",
    sidebar: {
      gradient: "bg-gradient-to-br from-[#312e81] via-[#6366f1] to-[#f472b6]",
      note: "Focalízate en recibir pacientes, asegurar su registro correcto y mantener la agenda en orden.",
    },
    navItems: [
      {
        key: "home",
        label: "Inicio",
        icon: "🏠",
        to: DASHBOARD_HOME.ASISTENTE,
        match: (pathname) => ["/dashboard", DASHBOARD_HOME.ASISTENTE].includes(pathname),
      },
      {
        key: "patients",
        label: "Pacientes",
        icon: "🧾",
        to: "/pacientes",
        match: (pathname) => pathname.startsWith("/pacientes"),
      },
      {
        key: "appointments",
        label: "Agenda",
        icon: "🗓️",
        to: "/citas",
        match: (pathname) => pathname.startsWith("/citas"),
      },
      {
        key: "history",
        label: "Historial clínico",
        icon: "📖",
        to: "/historial/consultar",
        match: (pathname) => pathname.startsWith("/historial"),
      },
      {
        key: "support",
        label: "Soporte",
        icon: "💬",
        to: "/soporte",
        match: (pathname) => pathname.startsWith("/soporte"),
      },
    ],
    stats: [
      {
        key: "nuevosPacientes7d",
        label: "Pacientes registrados",
        icon: "🧾",
        iconClass: "bg-indigo-100 text-indigo-600",
        trend: "Últimos 7 días",
      },
      {
        key: "citasSemana",
        label: "Citas agendadas",
        icon: "📅",
        iconClass: "bg-violet-100 text-violet-600",
        trendBuilder: (totals) => `${formatNumber(totals.citasPendientesHoy || 0)} por confirmar`,
      },
      {
        key: "citasHoy",
        label: "Check-in de hoy",
        icon: "✅",
        iconClass: "bg-emerald-100 text-emerald-600",
        trend: "Mantén el ritmo",
      },
      {
        key: "evolucionesSemana",
        label: "Historiales revisados",
        icon: "📖",
        iconClass: "bg-slate-100 text-slate-600",
        trend: "Solo lectura",
      },
    ],
    quickActions: [
      {
        icon: "🆕",
        iconClass: "bg-indigo-100 text-indigo-600",
        title: "Registrar paciente",
        subtitle: "Completa ficha inicial",
        wrapperClass: "hover:bg-indigo-50/80",
        to: "/pacientes/nuevo",
      },
      {
        icon: "📆",
        iconClass: "bg-violet-100 text-violet-600",
        title: "Agendar cita",
        subtitle: "Coordina con el médico disponible",
        wrapperClass: "hover:bg-violet-50/80",
        to: "/citas/nueva",
      },
      {
        icon: "👀",
        iconClass: "bg-slate-100 text-slate-600",
        title: "Consultar historial",
        subtitle: "Lectura rápida de antecedentes",
        wrapperClass: "hover:bg-slate-50",
        to: "/historial/consultar",
      },
      {
        icon: "📞",
        iconClass: "bg-emerald-100 text-emerald-600",
        title: "Confirmar asistencia",
        subtitle: "Contacta a tutores y pacientes",
        wrapperClass: "hover:bg-emerald-50/80",
        to: "/citas",
      },
    ],
    permissions: {
      allowed: [
        "Pacientes: registrar nuevos ingresos",
        "Citas: agendar y reorganizar horarios",
        "Historial clínico: visualizar información",
      ],
      limits: [
        "No puede eliminar pacientes",
        "Sin edición de historial clínico",
        "Sin gestión de usuarios",
      ],
    },
    reminderBuilder: ({ proximas }) => {
      if (!proximas || proximas.length === 0) {
        return {
          title: "Seguimiento",
          headline: "Confirma recordatorios",
          body: "Revisa los contactos pendientes y asegura la asistencia de los pacientes agendados.",
        };
      }
      const next = proximas[0];
      const start = next.inicio ? new Date(next.inicio) : null;
      const readable = start
        ? start.toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })
        : "Próximamente";
      return {
        title: "Próxima coordinación",
        headline: `${next?.paciente?.nombre || "Paciente"} · ${readable}`,
        body: "Verifica documentación y tutor antes de la llegada.",
      };
    },
    accent: {
      badge: "bg-gradient-to-r from-violet-100/90 to-rose-100/80 text-violet-700",
      badgeIcon: "🤝",
      permissionsAllowed: { bullet: "bg-violet-500" },
      permissionsLimit: { bullet: "bg-rose-400" },
      reminder: "bg-gradient-to-br from-indigo-100 to-rose-100 border-indigo-200/60",
    },
    scheduleAction: { title: "Ver agenda completa", to: "/citas" },
  },
};

export default function Dashboard({ forcedRole }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  const roleFromUser = (user?.rol || user?.role || "").toUpperCase();
  const role = forcedRole || roleFromUser || "ADMIN";

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardAPI.overview();
      setOverview(data);
    } catch (err) {
      console.error("[dashboard] overview", err);
      const message = err?.response?.data?.error || err?.message || "No se pudo cargar el dashboard";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = useCallback(() => {
    logoutStore();
    navigate("/", { replace: true });
  }, [logoutStore, navigate]);

  const handleQuickAction = useCallback(
    (action) => {
      if (!action?.to) return;
      navigate(action.to);
    },
    [navigate]
  );

  const config = useMemo(() => {
    const base = ROLE_BASE[role] || ROLE_BASE.ADMIN;
    const totals = overview?.totals || {};
    const agenda = overview?.agendaHoy || [];
    const schedule = buildSchedule(agenda);
    const proximas = overview?.proximasCitas || [];
    const summaryCount = agenda.length;

    const stats = base.stats.map((stat) => {
      const valueRaw = stat.key ? totals[stat.key] : stat.defaultValue;
      const value = stat.formatValue
        ? stat.formatValue(valueRaw, totals)
        : stat.key
        ? formatNumber(valueRaw ?? 0)
        : stat.value;
      const trend = stat.trendBuilder ? stat.trendBuilder(totals) : stat.trend || null;
      return { ...stat, value, trend };
    });

    let reminder = base.reminder;
    if (base.reminderBuilder) {
      reminder = base.reminderBuilder({ totals, proximas });
    }

    const navItems = base.navItems.map((item) => ({ ...item }));

    return {
      ...base,
      navItems,
      stats,
      schedule,
      scheduleSummary: `${summaryCount} ${summaryCount === 1 ? "cita" : "citas"}`,
      reminder,
    };
  }, [role, overview]);

  if (!user && !loading) {
    return null;
  }

  return (
    <>
      <Toaster position="top-right" />
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
          <div className="rounded-2xl bg-white px-6 py-5 shadow">Cargando panel...</div>
        </div>
      ) : error ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
          <div className="space-y-4 rounded-2xl bg-white px-6 py-5 text-center shadow">
            <p className="text-lg font-semibold text-rose-500">No se pudo cargar el dashboard</p>
            <p className="text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : (
        <RoleDashboard user={user} config={config} onLogout={handleLogout} onQuickAction={handleQuickAction} />
      )}
    </>
  );
}
