import { api } from "../lib/api";

export const getOrders = async () => {
  const response = await api.get("/order");

  return response.data.data;
};