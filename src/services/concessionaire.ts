import { apiClient } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/responses";

export interface DeviceSpecifications {
  type: string;
  power: string;
  range: string;
  accuracy: string;
  connectivity: string;
}

export interface Device {
  id: string;
  serialNumber: string;
  modelname: string;
  specifications: DeviceSpecifications;
  isActive: boolean;
  installedAt: string;
  deactivatedAt: string | null;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  concessionaireId: string;
  createdAt: string;
  updatedAt: string;
  devices: Device[];
}

export interface Concessionaire {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
  warehouses: Warehouse[];
}

export interface GetAllConcessionairesParams {
  q?: string;
  page?: number;
  limit?: number;
}

export const concessionaireService = {
  async getAllConcessionaires(
    params?: GetAllConcessionairesParams
  ): Promise<PaginatedResponse<Concessionaire>> {
    const response = await apiClient.get<PaginatedResponse<Concessionaire>>("/concessionaires", {
      params,
    });
    return response.data;
  },

  async getConcessionaireById(id: string): Promise<ApiResponse<Concessionaire>> {
    const response = await apiClient.get<ApiResponse<Concessionaire>>(`/concessionaires/${id}`);
    return response.data;
  },
};
