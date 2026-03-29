import { apiClient } from "@/lib/axios";

export interface TimeseriesPoint {
  timestamp: string;
  temperature: number;
}

export interface TemperatureKpi {
  breachCount: number;
  totalWindows: number;
  breachPercentage: number;
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
};
