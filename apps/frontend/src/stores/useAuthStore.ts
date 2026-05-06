import { create } from "zustand";
import type { User } from "@/types/auth/auth.types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;

  setAuth: (data: { user: User; accessToken: string; accessTokenExpiresAt: string }) => void;

  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,

  setAuth: (data) => set(data),
  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      accessTokenExpiresAt: null,
    }),
}));
