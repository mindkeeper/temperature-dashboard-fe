import { apiClient } from "@/lib/axios";

export interface BreachEvent {
  id: string;
  warehouseName: string;
  startedAt: string;
  durationMinutes: number | null;
  maxTemperature: number;
  unit: string;
  status: "Active" | "Resolved";
}

export interface BreachLogParams {
  concessId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface BreachLogResponse {
  message: string;
  data: BreachEvent[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const breachLogService = {
  async getBreachLog(params: BreachLogParams): Promise<BreachLogResponse> {
    const response = await apiClient.get<BreachLogResponse>("/alerts/breaches", {
      params,
    });
    return response.data;
  },
};
