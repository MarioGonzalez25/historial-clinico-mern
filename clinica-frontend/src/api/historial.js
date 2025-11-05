import { api } from "./client";

export const HistorialAPI = {
  listByPatient(patientId, params = {}) {
    return api
      .get("/historial", { params: { patientId, ...params } })
      .then((r) => r.data);
  },

  create(payload) {
    return api.post("/historial", payload).then((r) => r.data);
  },

  update(id, payload) {
    return api.patch(`/historial/${id}`, payload).then((r) => r.data);
  },
};
