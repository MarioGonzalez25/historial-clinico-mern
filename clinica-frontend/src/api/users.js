import { api } from "./client";

export const UsersAPI = {
  list() {
    return api.get("/users").then((r) => r.data);
  },

  listDoctors() {
    return api.get("/users/doctors").then((r) => r.data);
  },
};
