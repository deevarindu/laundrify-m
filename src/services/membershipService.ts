import { api } from "../lib/api";

export const getMemberships = async () => {
  const response = await api.get('/memberships')

  return response.data.data
}