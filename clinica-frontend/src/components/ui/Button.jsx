export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "w-full rounded-2xl px-5 py-3 font-semibold shadow-magic " +
        "bg-gradient-to-r from-primary-600 to-primary-500 text-white " +
        "hover:opacity-95 active:scale-[.99] transition " + className
      }
      {...props}
    >
      {children}
    </button>
  );
}
