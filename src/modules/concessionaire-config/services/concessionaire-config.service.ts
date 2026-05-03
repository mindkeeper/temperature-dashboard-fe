import { apiClient } from "@/lib/axios";
import type { Concessionaire } from "@/services/concessionaire";
import type { ApiResponse } from "@/types/responses";

import type {
  UpdateMyConcessionairePayload,
  UpdateMyWarehousePayload,
} from "../types/concessionaire-config.types";

export const concessionaireConfigService = {
  async getMyConcessionaire(): Promise<ApiResponse<Concessionaire>> {
    const response = await apiClient.get<ApiResponse<Concessionaire>>("/concessionaires/me");
    return response.data;
  },

  async updateMyConcessionaire(
    data: UpdateMyConcessionairePayload
  ): Promise<ApiResponse<{ data: Concessionaire }>> {
    const response = await apiClient.patch<ApiResponse<{ data: Concessionaire }>>(
      "/concessionaires/me",
      data
    );
    return response.data;
  },

  async updateMyWarehouse(
    warehouseId: string,
    data: UpdateMyWarehousePayload
  ): Promise<ApiResponse<{ data: unknown }>> {
    const response = await apiClient.patch<ApiResponse<{ data: unknown }>>(
      `/concessionaires/me/warehouses/${warehouseId}`,
      data
    );
    return response.data;
  },
};
