import { api } from "../lib/api";

export const getOrderStatusHistory = async () => {
  const response = await api.get('/order')

  return response.data.data;
}