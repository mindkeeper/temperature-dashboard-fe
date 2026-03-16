/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { authService } from "@/modules/auth/services/auth.service";
import { useAuthStore } from "@/modules/auth/store/auth.store";

import { env } from "./env";

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor: attach Authorization header from auth store
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    // Lazily import to avoid circular dependency at module init time
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 Unauthorized with token refresh
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors - attempt to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for sign-in endpoint
      if (originalRequest.url?.includes("/auth/sign-in")) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err: unknown) => {
            throw err instanceof Error ? err : new Error(String(err));
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().session?.refreshToken;
      const user = useAuthStore.getState().user;

      if (!refreshToken || !user) {
        isRefreshing = false;
        handleUnauthorized();
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }

      try {
        const newSession = await authService.refresh(refreshToken);
        useAuthStore.getState().setAuth(user, newSession);

        processQueue(null, newSession.accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newSession.accessToken}`;
        return await apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(
          refreshError instanceof Error ? refreshError : new Error(String(refreshError)),
          null
        );
        isRefreshing = false;
        handleUnauthorized();
        return Promise.reject(
          refreshError instanceof Error ? refreshError : new Error(String(refreshError))
        );
      }
    }

    if (error.response?.status === 403) {
      console.error("[API Error] Forbidden - Insufficient permissions");
    }

    if (error.response?.status === 404) {
      console.error("[API Error] Resource not found");
    }

    if (error.response?.status && error.response.status >= 500) {
      console.error("[API Error] Server error occurred");
    }

    if (error.code === "ECONNABORTED") {
      console.error("[API Error] Request timeout");
    }

    if (!error.response) {
      console.error("[API Error] Network error - Please check your connection");
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

function getAccessToken(): string | null {
  return useAuthStore.getState().session?.accessToken ?? null;
}

function handleUnauthorized(): void {
  useAuthStore.getState().clearAuth();
}
