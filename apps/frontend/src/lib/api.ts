import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { refreshUser } from "@/api/auth.api";
import { useAuthStore } from "@/stores/useAuthStore";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  // 로그인 시 내려주는 HttpOnly refresh 쿠키를 refresh 요청에 포함한다.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshPromise: Promise<string> | null = null;

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const req = error.config as RetryableRequestConfig | undefined;
    const status = (error as AxiosError).response?.status;
    const requestUrl = req?.url ?? "";
    const isRefreshRequest = requestUrl.includes("/v1/auth/refresh");

    if (!req || status !== 401 || req._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    req._retry = true;

    try {
      // 🔥 refresh 중복 방지
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const res = await refreshUser();
          const data = res.data;

          const { user, tokens } = data;

          useAuthStore.getState().setAuth({
            user,
            accessToken: tokens.accessToken,
            accessTokenExpiresAt: tokens.accessTokenExpiresAt,
          });

          return tokens.accessToken;
        })();
      }

      const newToken = await refreshPromise;
      refreshPromise = null;

      // 재요청
      req.headers.Authorization = `Bearer ${newToken}`;
      return api(req);
    } catch (err) {
      refreshPromise = null;
      useAuthStore.getState().clearAuth();
      return Promise.reject(err);
    }
  },
);
