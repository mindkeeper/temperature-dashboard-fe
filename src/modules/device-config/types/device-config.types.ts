import { z } from "zod";

// ─── Device Types ──────────────────────────────────────────────────────────────

export type ProvisionStatus = "PENDING" | "READY_FOR_PROVISIONING" | "PROVISIONED";

export interface DeviceListItem {
  id: string;
  serialNumber: string;
  modelname: string | null;
  isActive: boolean;
  provisionStatus: ProvisionStatus;
  installedAt: string;
  deactivatedAt: string | null;
  warehouse: {
    name: string;
    slug: string;
    concessionaire: {
      name: string;
      slug: string;
    };
  };
}

export interface DeviceListResponse {
  message: string;
  data: DeviceListItem[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetDevicesParams {
  page?: number;
  limit?: number;
  q?: string;
  concessionaireId?: string;
  concessionaireSlug?: string;
  warehouseSlug?: string;
}

// ─── Configuration Job Types ───────────────────────────────────────────────────

export type ConfigurationJobStatus = "PENDING" | "SUCCESS" | "FAILED" | "FAILED_TIMEOUT";

export interface ConfigurationJob {
  id: string;
  gatewayId: string;
  sensorId: string;
  status: ConfigurationJobStatus;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigureJobResponse {
  message: string;
  jobId: string;
}

export interface JobStatusResponse {
  message: string;
  id: string;
  gatewayId: string;
  sensorId: string;
  status: ConfigurationJobStatus;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Configuration Form Schema ─────────────────────────────────────────────────

export const configureFormSchema = z.object({
  interval: z
    .number({ message: "Interval is required" })
    .int("Must be a whole number")
    .min(1, "Minimum interval is 1 second")
    .max(3600, "Maximum interval is 3600 seconds (1 hour)"),
  temperatureOffset: z
    .number({ message: "Temperature offset is required" })
    .min(-10, "Minimum offset is -10°C")
    .max(10, "Maximum offset is 10°C"),
});

export type ConfigureFormValues = z.infer<typeof configureFormSchema>;

// ─── Configure Sensor Payload ──────────────────────────────────────────────────

export interface ConfigureSensorPayload {
  gatewayId: string;
  payload: ConfigureFormValues;
}

// ─── Create Device Types ───────────────────────────────────────────────────────

export interface CreateDevicePayload {
  serialNumber: string;
  modelname?: string;
  specifications?: Record<string, unknown>;
  installedAt: string;
  warehouseId: string;
}
