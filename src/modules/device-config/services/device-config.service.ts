import { apiClient } from "@/lib/axios";

import type {
  ConfigureSensorPayload,
  ConfigureJobResponse,
  CreateDevicePayload,
  CreateGatewayPayload,
  DeviceListResponse,
  GatewayResponse,
  GetDevicesParams,
  JobStatusResponse,
} from "../types/device-config.types";

export const deviceConfigService = {
  async getDevices(params?: GetDevicesParams): Promise<DeviceListResponse> {
    const response = await apiClient.get<DeviceListResponse>("/devices", {
      params,
    });
    return response.data;
  },

  async configureSensor(
    sensorId: string,
    body: ConfigureSensorPayload
  ): Promise<ConfigureJobResponse> {
    const response = await apiClient.post<ConfigureJobResponse>(
      `/sensors/${sensorId}/configure`,
      body
    );
    return response.data;
  },

  async createGateway(data: CreateGatewayPayload): Promise<GatewayResponse> {
    const response = await apiClient.post<GatewayResponse>("/devices/gateways", data);
    return response.data;
  },

  async createDevice(data: CreateDevicePayload): Promise<void> {
    await apiClient.post("/devices", data);
  },

  async connectGateway(id: string): Promise<void> {
    await apiClient.put(`/devices/${id}/connect`);
  },

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await apiClient.get<JobStatusResponse>(`/jobs/${jobId}`);
    return response.data;
  },

  async connectDevice(id: string): Promise<void> {
    await apiClient.put(`/devices/${id}/connect`);
  },
};
