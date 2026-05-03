import type { Concessionaire, Warehouse } from "@/services/concessionaire";

export type { Concessionaire, Warehouse };

export interface UpdateMyConcessionairePayload {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  telegramChatId?: string | null;
}

export interface UpdateMyWarehousePayload {
  name?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}
