import { api } from "../lib/api";

export type UpdateUserData = {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "STAFF";
};

export const getUsers = async () => {
  const response = await api.get("/user");

  return response.data.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get(`/user/${id}`);

  return response.data.data;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
}) => {
  const response = await api.post("/user", data);

  return response.data.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserData
) => {
  const response = await api.patch(`/user/${id}`, data);

  return response.data.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/user/${id}`);

  return response.data;
};
