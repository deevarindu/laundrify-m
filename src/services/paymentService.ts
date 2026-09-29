import { api } from "../lib/api";

export const getPayments = async () => {
  const response = await api.get("/payment");

  return response.data.data;
}