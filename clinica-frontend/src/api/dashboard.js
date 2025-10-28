import { api } from "./client";

export const DashboardAPI = {
  overview() {
    return api.get("/dashboard/overview").then((r) => r.data);
  },
};
