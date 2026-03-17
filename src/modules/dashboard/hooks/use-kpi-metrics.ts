import { useMemo, useState } from "react";

import type { WarehouseTemperatureAggregate } from "./use-warehouse-temperatures";

const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

interface KpiMetrics {
  activeDevices: {
    total: number;
    online: number;
    offline: number;
  };
  atRisk: {
    total: number;
    critical: number;
    warning: number;
  };
  dataFreshness: {
    staleCount: number;
  };
  averageTemp: {
    value: number | null;
    sensorCount: number;
    status: "green" | "orange" | "red" | "gray";
  };
}

const getTemperatureStatus = (temp: number): "green" | "orange" | "red" => {
  if (temp <= -20) return "green";
  if (temp <= -11) return "orange";
  return "red";
};

export const useKpiMetrics = (
  warehouses: WarehouseTemperatureAggregate[],
  currentTime?: number
): KpiMetrics => {
  const [initialTime] = useState(() => Date.now());
  const now = currentTime ?? initialTime;

  return useMemo(() => {
    // Active devices
    const totalDevices = warehouses.reduce((sum, w) => sum + w.deviceCount, 0);
    const onlineDevices = warehouses.reduce((sum, w) => sum + w.reportingDeviceCount, 0);
    const offlineDevices = totalDevices - onlineDevices;

    // Warehouses at risk
    const atRiskWarehouses = warehouses.filter((w) => w.status === "orange" || w.status === "red");
    const criticalCount = warehouses.filter((w) => w.status === "red").length;
    const warningCount = warehouses.filter((w) => w.status === "orange").length;

    // Data freshness
    const staleWarehouses = warehouses.filter(
      (w) => w.lastUpdate === null || now - w.lastUpdate > STALE_THRESHOLD_MS
    );

    // Average system temperature
    const temperaturesWithData = warehouses.filter((w) => w.averageTemperature !== null);
    const avgTemp =
      temperaturesWithData.length > 0
        ? temperaturesWithData.reduce((sum, w) => sum + (w.averageTemperature ?? 0), 0) /
          temperaturesWithData.length
        : null;
    const sensorCount = warehouses.reduce((sum, w) => sum + w.reportingDeviceCount, 0);
    const tempStatus = avgTemp === null ? "gray" : getTemperatureStatus(avgTemp);

    return {
      activeDevices: {
        total: totalDevices,
        online: onlineDevices,
        offline: offlineDevices,
      },
      atRisk: {
        total: atRiskWarehouses.length,
        critical: criticalCount,
        warning: warningCount,
      },
      dataFreshness: {
        staleCount: staleWarehouses.length,
      },
      averageTemp: {
        value: avgTemp,
        sensorCount,
        status: tempStatus,
      },
    };
  }, [warehouses, now]);
};
