import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: "http://192.168.18.80:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ini namanya axios interceptor, jd setiap mau ambil req menjalankan ini dulu
api.interceptors.request.use(async (config) => {
  // untuk ambil token yng disimpan dngan securestore
  const token = await SecureStore.getItemAsync("token");

  // kalau tokennya ada, tempel ke req
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});