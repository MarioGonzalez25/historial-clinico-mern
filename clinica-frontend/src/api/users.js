import { api } from "./client";

export const UsersAPI = {
  list() {
    return api.get("/users").then((r) => r.data);
  },

  listDoctors() {
    return api.get("/users/doctors").then((r) => r.data);
  },

  create(payload) {
    return api.post("/users", payload).then((r) => r.data);
  },

  update(id, payload) {
    return api.patch(`/users/${id}`, payload).then((r) => r.data);
  },

  remove(id) {
    return api.delete(`/users/${id}`);
  },
};
