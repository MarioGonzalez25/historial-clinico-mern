const cx = (...classes) => classes.filter(Boolean).join(" ");

function StatCard({ stat }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.45)] p-5 lg:p-6 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500/80">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
        </div>
        <span className={cx("inline-flex h-11 w-11 items-center justify-center rounded-xl text-lg", stat.iconClass)}>
          {stat.icon}
        </span>
      </div>
      {stat.trend && <p className={cx("mt-4 text-sm font-medium", stat.trendClass)}>{stat.trend}</p>}
    </div>
  );
}

function QuickAction({ action, onSelect }) {
  return (
    <button
      type="button"
      className={cx(
        "group flex w-full items-start gap-3 rounded-2xl border border-slate-200/60 bg-white px-4 py-4 text-left transition",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_-30px_rgba(79,70,229,0.7)]",
        action.wrapperClass
      )}
      onClick={() => onSelect?.(action)}
    >
      <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg", action.iconClass)}>
        {action.icon}
      </span>
      <div>
        <p className="text-base font-semibold text-slate-900">{action.title}</p>
        <p className="mt-1 text-sm text-slate-500/90">{action.subtitle}</p>
      </div>
    </button>
  );
}

function PermissionList({ title, items, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500/80">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={cx("mt-1.5 inline-block h-2 w-2 rounded-full", accent.bullet)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScheduleCard({ item }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-white p-4">
      <div className="flex h-12 w-16 flex-col items-center justify-center rounded-xl bg-slate-100/80 text-slate-700">
        <span className="text-xs font-semibold uppercase tracking-wide">{item.timePeriod}</span>
        <span className="text-sm font-semibold">{item.time}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{item.patient}</p>
        <p className="text-xs text-slate-500/90">{item.description}</p>
        {item.status && (
          <span className={cx("mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", item.statusClass)}>
            <span className="text-[11px]">●</span> {item.status}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RoleDashboard({ user, config, onLogout, onQuickAction }) {
  const roleLabel = config.roleLabel;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f1ff] via-[#fef6ff] to-[#f3f7ff] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col overflow-hidden rounded-[28px] border border-white/60 shadow-[0_35px_120px_-65px_rgba(79,70,229,0.65)] lg:flex-row">
        <aside className={cx("relative hidden w-full max-w-[270px] flex-none flex-col px-7 py-8 text-white lg:flex", config.sidebar.gradient)}>
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span className="grid h-10 w-10 place-content-center rounded-2xl bg-white/20 text-2xl">🏥</span>
            <div>
              <p className="text-sm text-white/70">Clínica Pediátrica</p>
              <p className="text-white">Dra. Wallis Trocolí</p>
            </div>
          </div>

          <nav className="mt-12 space-y-2 text-sm">
            {config.navItems.map((item) => (
              <div
                key={item.label}
                className={cx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition",
                  item.active
                    ? "bg-white text-slate-900 shadow-[0_20px_35px_-30px_rgba(15,23,42,0.7)]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-white/90">Resumen del rol</p>
            <p className="mt-2 text-xs leading-5 text-white/80">{config.sidebar.note}</p>
          </div>
        </aside>

        <main className="flex-1 bg-white/90 px-6 py-8 sm:px-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500/80">{config.subtitle}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                ¡Bienvenido{user?.nombre ? ", " : ""}
                {user?.nombre || "equipo"}! <span role="img" aria-label="mano saludando">👋</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-500/90">{config.description}</p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-3">
                <span className={cx("inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide", config.accent.badge)}>
                  <span className="text-base">{config.accent.badgeIcon}</span>
                  {roleLabel}
                </span>
                <div className="hidden text-right text-xs text-slate-400 sm:block">
                  <p>{user?.email}</p>
                  <p>ID: {user?._id?.slice(-6) || "---"}</p>
                </div>
              </div>

              <button
                onClick={() => onLogout?.()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white"
              >
                <span aria-hidden>⏏</span> Cerrar sesión
              </button>
            </div>
          </header>

          <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {config.stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </section>

          <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,_1.6fr)_minmax(0,_1fr)] xl:grid-cols-[minmax(0,_1.8fr)_minmax(0,_1fr)]">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Prioridad diaria</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {config.quickActions.map((action) => (
                    <QuickAction key={action.title} action={action} onSelect={onQuickAction} />
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <PermissionList title="Puede gestionar" items={config.permissions.allowed} accent={config.accent.permissionsAllowed} />
                <PermissionList title="Limitaciones" items={config.permissions.limits} accent={config.accent.permissionsLimit} />
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-[0_25px_70px_-55px_rgba(15,23,42,0.55)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Citas de hoy</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{config.scheduleSummary}</span>
                </div>
                <div className="mt-4 space-y-4">
                  {config.schedule.map((item) => (
                    <ScheduleCard key={`${item.time}-${item.patient}`} item={item} />
                  ))}
                </div>
              </div>

              <div className={cx(
                "rounded-3xl border border-transparent p-6 text-sm leading-relaxed text-slate-900 shadow-[0_25px_60px_-50px_rgba(79,70,229,0.65)]",
                config.accent.reminder
              )}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900/70">{config.reminder.title}</h3>
                <p className="mt-2 text-base font-semibold text-slate-900">{config.reminder.headline}</p>
                <p className="mt-3 text-sm text-slate-700/90">{config.reminder.body}</p>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
