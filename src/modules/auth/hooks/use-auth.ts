import { useNavigate } from "react-router";

import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type { LoginCredentials } from "../types/auth.types";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setSession = useAuthStore((s) => s.setSession);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  async function login(credentials: LoginCredentials): Promise<void> {
    const { session } = await authService.login(credentials);
    // Set session first so the axios interceptor can attach the Authorization header
    setSession(session);
    const user = await authService.me();
    setAuth(user, session);
    await navigate("/dashboard");
  }

  async function logout(): Promise<void> {
    clearAuth();
    await navigate("/login");
  }

  return { user, isAuthenticated, login, logout };
}
