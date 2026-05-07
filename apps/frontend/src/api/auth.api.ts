import { api } from "@/lib/api";
import type { AuthResponse, User, UserDashboard } from "@/types/auth/auth.types";

export const loginUser = async () => {
  const data = await api.post<AuthResponse>("/v1/auth/guest/login");
  return data;
};

export const refreshUser = async () => {
  const data = await api.post<AuthResponse>("/v1/auth/refresh");
  return data;
};

export const userInfo = async () => {
  const data = await api.get<User>("/v1/users/me");
  return data.data;
};

export const userDashboard = async () => {
  const data = await api.get<UserDashboard>("/v1/users/me/dashboard");
  return data;
};
