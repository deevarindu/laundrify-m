import { api } from "../lib/api";

export const getUsers = async () => {
  const response = await api.get("/user");

  return response.data.data;
}

export const getUserById = async (id: Number) => {
  const response =await api.get(`/user/${id}`)

  return response.data.data;
}