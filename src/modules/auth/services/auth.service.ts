import { apiClient } from "@/lib/axios";

import type { AuthUser, LoginCredentials, Session } from "../types/auth.types";

interface SignInResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

interface MeResponse {
  message: string;
  id: string;
  email: string;
  name: string | null;
  role: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
  isNewAccount: boolean;
  concessionaries: {
    concessionaireId: string;
    concessionaireName: string;
  }[];
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ session: Session }> {
    const { data } = await apiClient.post<SignInResponse>("/auth/sign-in", credentials);
    return {
      session: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    };
  },

  async refresh(refreshToken: string): Promise<Session> {
    const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", { refreshToken });
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<MeResponse>("/users/me");
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      isNewAccount: data.isNewAccount,
      concessionaries: data.concessionaries,
    };
  },
};
