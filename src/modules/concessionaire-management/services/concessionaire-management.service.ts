import { apiClient } from "@/lib/axios";
import type { Concessionaire } from "@/services/concessionaire";
import type { ApiResponse } from "@/types/responses";

import type {
  CreateConcessionairePayload,
  CreateWarehousePayload,
  UpdateConcessionairePayload,
  UpdateWarehousePayload,
} from "../types/concessionaire-management.types";

export const concessionaireManagementService = {
  async updateConcessionaire(
    id: string,
    data: UpdateConcessionairePayload
  ): Promise<ApiResponse<{ data: Concessionaire }>> {
    const response = await apiClient.patch<ApiResponse<{ data: Concessionaire }>>(
      `/concessionaires/${id}`,
      data
    );
    return response.data;
  },

  async createConcessionaire(
    data: CreateConcessionairePayload
  ): Promise<ApiResponse<{ data: Concessionaire }>> {
    const response = await apiClient.post<ApiResponse<{ data: Concessionaire }>>(
      "/concessionaires",
      data
    );
    return response.data;
  },

  async createWarehouse(data: CreateWarehousePayload): Promise<ApiResponse<{ data: unknown }>> {
    const response = await apiClient.post<ApiResponse<{ data: unknown }>>("/warehouses", data);
    return response.data;
  },

  async updateWarehouse(
    id: string,
    data: UpdateWarehousePayload
  ): Promise<ApiResponse<{ data: unknown }>> {
    const response = await apiClient.patch<ApiResponse<{ data: unknown }>>(
      `/warehouses/${id}`,
      data
    );
    return response.data;
  },
};
