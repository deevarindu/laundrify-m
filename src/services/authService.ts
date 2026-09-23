import * as SecureStore from "expo-secure-store";
import { api } from "../lib/api";

type LoginData = {
  email: string;
  password: string;
};

export const login = async ({ email, password }: LoginData) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const { token, user } = response.data.data;

  // secure store ini untuk session checking/persist
  await SecureStore.setItemAsync("token", token);

  return user;
};

export const getMe = async () => {
  const response =await api.get("/auth/me");
  
  return response.data.data;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync("token");
};