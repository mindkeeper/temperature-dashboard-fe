import { apiClient } from "@/lib/axios";

export interface TimeseriesPoint {
  timestamp: string;
  temperature: number;
}

export interface TemperatureKpi {
  breachCount: number;
  totalDurationMinutes: number | null;
}

export interface WarehouseTimeseries {
  warehouseId: string;
  warehouseName: string;
  series: TimeseriesPoint[];
  kpi: TemperatureKpi;
}

export interface GetTimeseriesParams {
  concessId: string;
  startDate?: string;
  endDate?: string;
  interval?: string;
}

export interface ExportTimeseriesParams {
  concessId: string;
  startDate?: string;
  endDate?: string;
  interval?: string;
}

interface TimeseriesResponse {
  message: string;
  data: WarehouseTimeseries[];
}

export const statsService = {
  async getTimeseries(params: GetTimeseriesParams): Promise<TimeseriesResponse> {
    const response = await apiClient.get<TimeseriesResponse>("/stats/timeseries", {
      params,
    });
    return response.data;
  },

  async exportTimeseries(params: ExportTimeseriesParams): Promise<Blob> {
    const response = await apiClient.get("/stats/timeseries/export", {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
