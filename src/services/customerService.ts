import { api } from "../lib/api";

export const getCustomers = async () => {
  const response = await api.get("/customer")

  return response.data.data;
}

export const getCustomerById = async (id: Number) => {
  const response = await api.get(`/customer/${id}`)

  return response.data.data;
}