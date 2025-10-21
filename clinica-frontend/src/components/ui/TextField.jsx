export default function TextField({ label, icon, ...props }) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-semibold text-gray-700">{label}</span>}
      <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500/30">
        {icon ? <span className="opacity-70">{icon}</span> : null}
        <input className="w-full outline-none placeholder:text-gray-400" {...props} />
      </div>
    </label>
  );
}
