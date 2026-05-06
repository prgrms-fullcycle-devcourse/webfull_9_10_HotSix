import { api } from "@/lib/api";
import type { AuthResponse } from "@/types/auth/auth.types";

export const loginUser = async () => {
  const data = await api.post<AuthResponse>("/v1/auth/guest/login");
  return data;
};

export const refreshUser = async () => {
  const data = await api.post<AuthResponse>("/v1/auth/refresh");
  return data;
};
