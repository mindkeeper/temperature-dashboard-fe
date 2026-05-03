export interface UpdateProfilePayload {
  name: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUser {
  id: string;
  email: string;
  name: string | null;
  role: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
  isNewAccount: boolean;
  updatedAt: string;
}
