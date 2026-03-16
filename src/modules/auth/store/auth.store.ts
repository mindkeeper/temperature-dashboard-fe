import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { AuthState, AuthUser, Session } from "../types/auth.types";

interface AuthStore extends AuthState {
  setAuth: (user: AuthUser, session: Session) => void;
  setSession: (session: Session) => void;
  clearAuth: () => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        session: null,
        isAuthenticated: false,
        setAuth: (user, session) => set({ user, session, isAuthenticated: true }),
        setSession: (session) => set({ session }),
        clearAuth: () => set({ user: null, session: null, isAuthenticated: false }),
        getToken: () => get().session?.accessToken ?? null,
      }),
      { name: "auth" }
    ),
    { name: "auth-store" }
  )
);
