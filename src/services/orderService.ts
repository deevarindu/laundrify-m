import { api } from "../lib/api";

export const getOrders = async () => {
  const response = await api.get("/order");

  return response.data.data;
};

export const getOrderById = async (id: number) => {
  const response = await api.get(`/order/${id}`)

  return response.data.data;
}