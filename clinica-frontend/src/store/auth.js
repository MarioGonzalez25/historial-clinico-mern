import { create } from "zustand";
import { AuthAPI } from "../api/auth";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  loadingMe: false,

  loginOk: ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: "", user: null });
  },

  // Para refrescar sesión al recargar
  async fetchMeIfToken() {
    const { token } = get();
    if (!token) return;
    try {
      set({ loadingMe: true });
      const data = await AuthAPI.me();
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      get().logout();
    } finally {
      set({ loadingMe: false });
    }
  },
}));
