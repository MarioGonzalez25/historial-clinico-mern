import { api } from "./client";

export const soporteApi = {
  crearTicket: async (payload) => {
    const { data } = await api.post("/soporte/tickets", payload);
    return data.ticket;
  },
  listarMisTickets: async (params = {}) => {
    const { data } = await api.get("/soporte/tickets", { params });
    return data;
  },
};
