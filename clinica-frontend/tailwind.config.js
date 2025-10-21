/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 500: "#7C3AED", 600: "#6D28D9" },
        panelL: "#D7CCFF",
        panelR: "#B7D7FF",
      },
      boxShadow: {
        magic: "0 20px 60px rgba(124,58,237,.25)",
      },
    },
  },
  plugins: [],
};
