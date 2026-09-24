import { api } from "../lib/api";

export const getServices = async () => {
  const response = await api.get("/service")

  return response.data.data;
}

export const getServiceById = async (id: Number) => {
  const response = await api.get(`/service/${id}`);

  return response.data.data;
}