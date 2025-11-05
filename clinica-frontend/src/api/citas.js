import { api } from "./client";

export const CitasAPI = {
  list(params = {}) {
    return api
      .get("/citas", { params })
      .then((r) => r.data);
  },

  create(payload) {
    return api.post("/citas", payload).then((r) => r.data);
  },

  updateEstado(id, estado) {
    return api.patch(`/citas/${id}/estado`, { estado }).then((r) => r.data);
  },

  reprogramar(id, payload) {
    return api.patch(`/citas/${id}/reprogramar`, payload).then((r) => r.data);
  },

  remove(id) {
    return api.delete(`/citas/${id}`).then((r) => r.data);
  },
};
