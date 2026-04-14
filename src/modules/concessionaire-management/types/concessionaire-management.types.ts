import type { Concessionaire, Warehouse } from "@/services/concessionaire";

export type { Concessionaire, Warehouse };

export interface CreateConcessionairePayload {
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  warehouses?: CreateWarehouseInConcessionairePayload[];
}

export interface CreateWarehouseInConcessionairePayload {
  name: string;
  slug: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateConcessionairePayload {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  telegramChatId?: string | null;
  alertEmails?: string[];
}

export interface CreateWarehousePayload {
  name: string;
  slug: string;
  address: string;
  latitude?: number;
  longitude?: number;
  concessionaireId: string;
}

export interface UpdateWarehousePayload {
  name?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}
