import RoleDashboard from "../components/dashboard/RoleDashboard";
import { useAuthStore } from "../store/auth";

const CONFIGS = {
  ADMIN: {
    roleLabel: "Administrador",
    subtitle: "Panel general del sistema",
    description: "Supervisa usuarios, pacientes, agendas y métricas clave de la clínica en un solo lugar.",
    sidebar: {
      gradient: "bg-gradient-to-br from-[#4c1d95] via-[#7c3aed] to-[#db2777]",
      note: "Acceso total para configurar usuarios, revisar reportes y ajustar la operación diaria de la clínica.",
    },
    navItems: [
      { label: "Inicio", icon: "🏠", active: true },
      { label: "Pacientes", icon: "🧒" },
      { label: "Citas", icon: "📅" },
      { label: "Historial clínico", icon: "📋" },
      { label: "Usuarios", icon: "🧑‍⚕️" },
      { label: "Reportes", icon: "📊" },
      { label: "Configuración", icon: "⚙️" },
    ],
    stats: [
      {
        label: "Total pacientes",
        value: "245",
        icon: "👨‍👩‍👧",
        iconClass: "bg-violet-100 text-violet-600",
        trend: "+12 vs. el mes pasado",
        trendClass: "text-violet-600",
      },
      {
        label: "Citas hoy",
        value: "12",
        icon: "📅",
        iconClass: "bg-rose-100 text-rose-600",
        trend: "4 en seguimiento",
        trendClass: "text-rose-500",
      },
      {
        label: "Esta semana",
        value: "48",
        icon: "🗓️",
        iconClass: "bg-indigo-100 text-indigo-600",
        trend: "Agenda al 72%",
        trendClass: "text-indigo-600",
      },
      {
        label: "Nuevos ingresos",
        value: "5",
        icon: "✨",
        iconClass: "bg-emerald-100 text-emerald-600",
        trend: "3 referidos",
        trendClass: "text-emerald-600",
      },
    ],
    quickActions: [
      {
        icon: "➕",
        iconClass: "bg-violet-100 text-violet-600",
        title: "Nuevo paciente",
        subtitle: "Registrar ficha y datos del tutor",
        wrapperClass: "hover:bg-violet-50/80",
      },
      {
        icon: "📅",
        iconClass: "bg-rose-100 text-rose-500",
        title: "Nueva cita",
        subtitle: "Asignar médico y consultorio",
        wrapperClass: "hover:bg-rose-50/80",
      },
      {
        icon: "🧑‍⚕️",
        iconClass: "bg-indigo-100 text-indigo-600",
        title: "Gestionar usuarios",
        subtitle: "Crear o suspender cuentas",
        wrapperClass: "hover:bg-indigo-50/80",
      },
      {
        icon: "📊",
        iconClass: "bg-emerald-100 text-emerald-600",
        title: "Ver reportes",
        subtitle: "Indicadores de servicio",
        wrapperClass: "hover:bg-emerald-50/80",
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
    scheduleSummary: "4 citas",
    schedule: [
      {
        timePeriod: "AM",
        time: "09:00",
        patient: "Ana María López",
        description: "Control pediátrico - Dr. Pérez",
        status: "Confirmada",
        statusClass: "bg-emerald-100 text-emerald-600",
      },
      {
        timePeriod: "AM",
        time: "11:30",
        patient: "Luis Herrera",
        description: "Vacunación",
        status: "En sala de espera",
        statusClass: "bg-amber-100 text-amber-700",
      },
      {
        timePeriod: "PM",
        time: "15:00",
        patient: "Valeria Gómez",
        description: "Consulta de seguimiento",
        status: "Pendiente",
        statusClass: "bg-sky-100 text-sky-700",
      },
      {
        timePeriod: "PM",
        time: "17:30",
        patient: "Ignacio Rivas",
        description: "Evaluación nutricional",
        status: "Confirmada",
        statusClass: "bg-emerald-100 text-emerald-600",
      },
    ],
    reminder: {
      title: "Recordatorio",
      headline: "Revisa los reportes semanales",
      body: "Analiza la ocupación de consultorios y el rendimiento de tu equipo para ajustar la programación del fin de semana.",
    },
    accent: {
      badge: "bg-gradient-to-r from-violet-100/90 to-rose-100/80 text-violet-700",
      badgeIcon: "⭐",
      permissionsAllowed: { bullet: "bg-violet-500" },
      permissionsLimit: { bullet: "bg-rose-400" },
      reminder: "bg-gradient-to-br from-violet-100 to-rose-100 border-violet-200/60",
    },
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
      { label: "Inicio", icon: "🏠", active: true },
      { label: "Mis pacientes", icon: "🩺" },
      { label: "Mis citas", icon: "🗓️" },
      { label: "Historial clínico", icon: "📚" },
      { label: "Reportes", icon: "📈" },
    ],
    stats: [
      {
        label: "Pacientes activos",
        value: "82",
        icon: "🩺",
        iconClass: "bg-sky-100 text-sky-600",
        trend: "+5 en seguimiento",
        trendClass: "text-sky-600",
      },
      {
        label: "Citas hoy",
        value: "6",
        icon: "⏰",
        iconClass: "bg-cyan-100 text-cyan-600",
        trend: "2 virtuales",
        trendClass: "text-cyan-600",
      },
      {
        label: "Pendientes",
        value: "9",
        icon: "📝",
        iconClass: "bg-indigo-100 text-indigo-600",
        trend: "Actualizar notas",
        trendClass: "text-indigo-600",
      },
      {
        label: "Satisfacción",
        value: "4.9",
        icon: "💙",
        iconClass: "bg-emerald-100 text-emerald-600",
        trend: "Top 5 del mes",
        trendClass: "text-emerald-600",
      },
    ],
    quickActions: [
      {
        icon: "🩺",
        iconClass: "bg-sky-100 text-sky-600",
        title: "Registrar evolución",
        subtitle: "Actualiza el historial clínico",
        wrapperClass: "hover:bg-sky-50/80",
      },
      {
        icon: "➕",
        iconClass: "bg-cyan-100 text-cyan-600",
        title: "Nuevo paciente",
        subtitle: "Carga datos básicos y antecedentes",
        wrapperClass: "hover:bg-cyan-50/80",
      },
      {
        icon: "🗓️",
        iconClass: "bg-indigo-100 text-indigo-600",
        title: "Programar cita",
        subtitle: "Coordina horarios disponibles",
        wrapperClass: "hover:bg-indigo-50/80",
      },
      {
        icon: "📄",
        iconClass: "bg-emerald-100 text-emerald-600",
        title: "Notas rápidas",
        subtitle: "Checklist preconsulta",
        wrapperClass: "hover:bg-emerald-50/80",
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
    scheduleSummary: "3 citas",
    schedule: [
      {
        timePeriod: "AM",
        time: "08:30",
        patient: "Mateo Fernández",
        description: "Control respiratorio",
        status: "En curso",
        statusClass: "bg-amber-100 text-amber-700",
      },
      {
        timePeriod: "AM",
        time: "10:00",
        patient: "Lucía Ortega",
        description: "Seguimiento nutricional",
        status: "Confirmada",
        statusClass: "bg-emerald-100 text-emerald-600",
      },
      {
        timePeriod: "PM",
        time: "16:30",
        patient: "Samuel Díaz",
        description: "Teleconsulta",
        status: "Virtual",
        statusClass: "bg-sky-100 text-sky-700",
      },
    ],
    reminder: {
      title: "Consejo",
      headline: "Revisa las notas pre consulta",
      body: "Dedica unos minutos antes de cada cita para repasar antecedentes y alergias registrados.",
    },
    accent: {
      badge: "bg-gradient-to-r from-sky-100/90 to-cyan-100/90 text-sky-700",
      badgeIcon: "🩺",
      permissionsAllowed: { bullet: "bg-sky-500" },
      permissionsLimit: { bullet: "bg-slate-400" },
      reminder: "bg-gradient-to-br from-sky-100 to-cyan-100 border-sky-200/60",
    },
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
      { label: "Inicio", icon: "🏠", active: true },
      { label: "Pacientes", icon: "🧾" },
      { label: "Agenda", icon: "🗓️" },
      { label: "Historial clínico", icon: "📖" },
      { label: "Soporte", icon: "💬" },
    ],
    stats: [
      {
        label: "Pacientes registrados",
        value: "32",
        icon: "🧾",
        iconClass: "bg-indigo-100 text-indigo-600",
        trend: "+7 esta semana",
        trendClass: "text-indigo-600",
      },
      {
        label: "Citas agendadas",
        value: "18",
        icon: "📅",
        iconClass: "bg-violet-100 text-violet-600",
        trend: "4 requieren confirmación",
        trendClass: "text-violet-600",
      },
      {
        label: "Check-in completado",
        value: "11",
        icon: "✅",
        iconClass: "bg-emerald-100 text-emerald-600",
        trend: "Mantén el ritmo",
        trendClass: "text-emerald-600",
      },
      {
        label: "Historiales consultados",
        value: "14",
        icon: "📖",
        iconClass: "bg-slate-100 text-slate-600",
        trend: "Solo lectura",
        trendClass: "text-slate-500",
      },
    ],
    quickActions: [
      {
        icon: "🆕",
        iconClass: "bg-indigo-100 text-indigo-600",
        title: "Registrar paciente",
        subtitle: "Completa ficha inicial",
        wrapperClass: "hover:bg-indigo-50/80",
      },
      {
        icon: "📆",
        iconClass: "bg-violet-100 text-violet-600",
        title: "Agendar cita",
        subtitle: "Coordina con el médico disponible",
        wrapperClass: "hover:bg-violet-50/80",
      },
      {
        icon: "👀",
        iconClass: "bg-slate-100 text-slate-600",
        title: "Consultar historial",
        subtitle: "Lectura rápida de antecedentes",
        wrapperClass: "hover:bg-slate-50",
      },
      {
        icon: "📞",
        iconClass: "bg-emerald-100 text-emerald-600",
        title: "Confirmar asistencia",
        subtitle: "Contacta a tutores y pacientes",
        wrapperClass: "hover:bg-emerald-50/80",
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
    scheduleSummary: "3 citas",
    schedule: [
      {
        timePeriod: "AM",
        time: "09:15",
        patient: "Emily Duarte",
        description: "Ingreso y documentación",
        status: "Check-in listo",
        statusClass: "bg-emerald-100 text-emerald-600",
      },
      {
        timePeriod: "AM",
        time: "11:00",
        patient: "Tomás Aguilar",
        description: "Vacuna refuerzo",
        status: "Confirmar tutor",
        statusClass: "bg-amber-100 text-amber-700",
      },
      {
        timePeriod: "PM",
        time: "14:45",
        patient: "Isabella Ruiz",
        description: "Consulta general",
        status: "Pendiente",
        statusClass: "bg-sky-100 text-sky-700",
      },
    ],
    reminder: {
      title: "Tips operativos",
      headline: "Confirma las citas de la tarde",
      body: "Un mensaje temprano evita inasistencias y ayuda a reorganizar la agenda del equipo médico.",
    },
    accent: {
      badge: "bg-gradient-to-r from-indigo-100/90 to-pink-100/80 text-indigo-700",
      badgeIcon: "💼",
      permissionsAllowed: { bullet: "bg-indigo-500" },
      permissionsLimit: { bullet: "bg-rose-400" },
      reminder: "bg-gradient-to-br from-indigo-100 to-pink-100 border-indigo-200/60",
    },
  },
};

export default function Dashboard({ forcedRole }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const role = (forcedRole || user?.rol || user?.role || "ASISTENTE").toUpperCase();
  const config = CONFIGS[role] || CONFIGS.ASISTENTE;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900/90 text-white">
        <div className="rounded-2xl bg-white/10 px-8 py-6 text-sm backdrop-blur">
          Preparando tu panel…
        </div>
      </div>
    );
  }

  return <RoleDashboard user={user} config={config} onLogout={logout} />;
}
