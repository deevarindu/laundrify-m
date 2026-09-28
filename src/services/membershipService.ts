import { api } from "../lib/api";

export type CreateMembershipData = {
  customerId: number;
  discountPercent?: number;
};

export type UpdateMembershipData = {
  customerId?: number;
  discountPercent?: number;
  isActive?: boolean;
};

export const getMemberships = async () => {
  const response = await api.get("/membership");

  return response.data.data;
};

export const getMembershipById = async (id: number) => {
  const response = await api.get(`/membership/${id}`);

  return response.data.data;
};

export const createMembership = async (
  data: CreateMembershipData
) => {
  const response = await api.post("/membership", data);

  return response.data.data;
};

export const updateMembership = async (
  id: number,
  data: UpdateMembershipData
) => {
  const response = await api.patch(`/membership/${id}`, data);

  return response.data.data;
};

export const deleteMembership = async (id: number) => {
  const response = await api.delete(`/membership/${id}`);

  return response.data;
};