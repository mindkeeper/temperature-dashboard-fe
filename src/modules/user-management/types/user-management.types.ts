export interface UserConcessionaire {
  concessionaireId: string;
  concessionaire: {
    id: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
  isNewAccount: boolean;
  concessionaries: UserConcessionaire[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  name?: string;
  role: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
  concessionaireId?: string;
}

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  role?: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
  concessionaireId?: string;
}

export interface GetUsersParams {
  q?: string;
  role?: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
  page?: number;
  limit?: number;
}
