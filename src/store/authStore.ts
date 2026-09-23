import { create } from "zustand";
import { getMe } from "../services/authService";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
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

  // cek di secure store masih ada tokennya atau TouchableNativeFeedback, dan jika ada siapa usernya
  checkAuth: async () => {
    try {
      // backend akan melihat jwt yang otomatis ditempel axios
      const user = await getMe();

      // kalau token valid:
      set({ user });
    } catch (error) {
      // kalau tdk valid
      set({ user: null });
    }
  },
}));