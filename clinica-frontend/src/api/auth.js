// src/api/auth.js
import { api } from "./client";

export const AuthAPI = {
  // Login
  login(email, password) {
    return api.post("/auth/login", { email, password }).then(r => r.data);
  },

  register(payload) {
    return api.post("/auth/register", payload).then(r => r.data);
  },

  // Usuario actual (si hay token)
  me() {
    return api.get("/auth/me").then(r => r.data);
  },

  // Olvidé mi contraseña
  forgot(email) {
    return api.post("/auth/forgot-password", { email }).then(r => r.data);
  },

  // Reset de contraseña
  // 👉 Tu backend valida "newPassword" (mensaje: "Nueva contraseña es requerida"),
  //    así que enviamos newPassword + confirmPassword. Incluyo también "password"
  //    por compatibilidad con otros handlers.
  reset(token, newPass) {
    const payload = {
      token,                // token del enlace
      newPassword: newPass, // <- requerido por tu backend
      confirmPassword: newPass,
      password: newPass,    // compatibilidad si el server también acepta "password"
    };
    return api.post("/auth/reset-password", payload).then(r => r.data);
  },

  // Cambiar contraseña autenticado
  changePassword(currentPassword, newPassword) {
    return api
      .post("/auth/change-password", { currentPassword, newPassword })
      .then(r => r.data);
  },
};
