import { useState } from "react";

export default function PasswordField({ label, icon, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-semibold text-gray-700">{label}</span>}
      <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500/30">
        {icon ? <span className="opacity-70">{icon}</span> : null}
        <input
          type={show ? "text" : "password"}
          className="w-full outline-none placeholder:text-gray-400"
          {...props}
        />
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => setShow((s) => !s)}
        >
          {show ? "Ocultar" : "Ver"}
        </button>
      </div>
    </label>
  );
}
