import { create } from "zustand";
import { getMe } from "../services/authService";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
};

type AuthState = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => {
    set({ user });
  },

  clearUser: () => {
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const user = await getMe();

      set({ user });
    } catch (error) {
      set({ user: null });
    }
  },
}));