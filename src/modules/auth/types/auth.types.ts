import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
  isNewAccount: boolean;
  concessionaries: {
    concessionaireId: string;
    concessionaireName: string;
  }[];
}

export interface Session {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
}
