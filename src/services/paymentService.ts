import { api } from "../lib/api";

export const getPayments = async () => {
  const response = await api.get("/payments");

  return response.data.data;
}