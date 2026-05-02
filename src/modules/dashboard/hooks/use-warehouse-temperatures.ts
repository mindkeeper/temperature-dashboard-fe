import { useMemo } from "react";

import type { Concessionaire } from "@/services/concessionaire";

interface TemperatureData {
  sn: string;
  temp: number;
  unit: string;
  ts: number;
}

type TemperatureMap = Record<string, TemperatureData>;

export interface WarehouseTemperatureAggregate {
  warehouseId: string;
  warehouseName: string;
  address: string;
  latitude: number;
  longitude: number;
  concessionaireName: string;
  averageTemperature: number | null;
  lastKnownAverageTemperature: number | null;
  unit: string;
  deviceCount: number;
  reportingDeviceCount: number;
  lastUpdate: number | null;
  status: "green" | "orange" | "red" | "gray";
}

const ONLINE_THRESHOLD_MS = 10 * 1000; // 10 seconds

const getTemperatureStatus = (temp: number): "green" | "orange" | "red" => {
  if (temp <= -16) return "green";
  if (temp <= -11) return "orange";
  return "red";
};

/**
 * Aggregates device-level temperature data into warehouse-level metrics
 * @param concessionaires - List of concessionaires with warehouses
 * @param temperatureMap - Real-time temperature data keyed by device serial number
 * @param currentTime - Current timestamp in ms (for freshness check); defaults to Date.now()
 * @returns Array of warehouse temperature aggregates
 */
export const useWarehouseTemperatures = (
  concessionaires: Concessionaire[],
  temperatureMap: TemperatureMap,
  currentTime?: number
): WarehouseTemperatureAggregate[] => {
  return useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = currentTime ?? Date.now();
    const aggregates: WarehouseTemperatureAggregate[] = [];

    for (const concessionaire of concessionaires) {
      for (const warehouse of concessionaire.warehouses) {
        // Filter active devices only
        const activeDevices = warehouse.devices.filter((device) => device.isActive);

        // Get temperature readings for active devices that reported within the threshold
        const deviceReadings = activeDevices
          .map((device) => temperatureMap[device.serialNumber])
          .filter(
            (reading): reading is TemperatureData =>
              reading !== undefined && now - reading.ts <= ONLINE_THRESHOLD_MS
          );

        // Calculate average temperature from fresh readings only
        const averageTemperature =
          deviceReadings.length > 0
            ? deviceReadings.reduce((sum, reading) => sum + reading.temp, 0) / deviceReadings.length
            : null;

        // Calculate last known average from all readings (including stale) for offline display
        const allDeviceReadings = activeDevices
          .map((device) => temperatureMap[device.serialNumber])
          .filter((reading): reading is TemperatureData => reading !== undefined);
        const lastKnownAverageTemperature =
          allDeviceReadings.length > 0
            ? allDeviceReadings.reduce((sum, r) => sum + r.temp, 0) / allDeviceReadings.length
            : null;

        // Find most recent timestamp across all readings (including stale)
        const lastUpdate =
          allDeviceReadings.length > 0 ? Math.max(...allDeviceReadings.map((r) => r.ts)) : null;

        // Determine status
        const status =
          averageTemperature === null ? "gray" : getTemperatureStatus(averageTemperature);

        // Get unit (assume consistent units, use first reading or default to "C")
        const unit = deviceReadings[0]?.unit ?? "C";

        aggregates.push({
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          address: warehouse.address,
          latitude: warehouse.latitude,
          longitude: warehouse.longitude,
          concessionaireName: concessionaire.name,
          averageTemperature,
          lastKnownAverageTemperature,
          unit,
          deviceCount: activeDevices.length,
          reportingDeviceCount: deviceReadings.length,
          lastUpdate,
          status,
        });
      }
    }

    return aggregates;
  }, [concessionaires, temperatureMap, currentTime]);
};
