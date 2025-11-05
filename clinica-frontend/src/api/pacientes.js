import { api } from "./client";

export const PacientesAPI = {
  list(params = {}) {
    return api
      .get("/pacientes", { params })
      .then((r) => r.data);
  },

  create(payload) {
    return api.post("/pacientes", payload).then((r) => r.data);
  },

  get(id) {
    return api.get(`/pacientes/${id}`).then((r) => r.data);
  },

  update(id, payload) {
    return api.put(`/pacientes/${id}`, payload).then((r) => r.data);
  },

  remove(id) {
    return api.delete(`/pacientes/${id}`).then((r) => r.data);
  },
};
