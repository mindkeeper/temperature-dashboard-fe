import { AlertTriangle, Clock, Radio, Thermometer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/modules/auth";

import { useConcessionaire } from "../hooks/use-concessionaire";
import { useKpiMetrics } from "../hooks/use-kpi-metrics";
import { useTemperature } from "../hooks/use-temperature";
import { useWarehouseTemperatures } from "../hooks/use-warehouse-temperatures";

import { BreachLogTable } from "./breach-log-table";
import { ConcessionaireTemperatureCard } from "./concessionaire-temperature-card";
import { KpiCard } from "./kpi-card";
import { TemperatureTimeseriesCard } from "./temperature-timeseries-card";

export function ConcessionaireDashboard() {
  const { user } = useAuth();
  const concessId = user?.concessionaries[0]?.concessionaireId;
  const { data, isLoading } = useConcessionaire(concessId ?? "");

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const { data: temperatureMap = {} } = useTemperature();

  // Wrap single concessionaire into the shape useWarehouseTemperatures expects
  const concessionaireList = useMemo(() => (data ? [data] : []), [data]);

  const warehouseTemperatures = useWarehouseTemperatures(
    concessionaireList,
    temperatureMap,
    currentTime
  );

  const metrics = useKpiMetrics(warehouseTemperatures, currentTime);

  // Build live temperature cards from temperatureMap keyed by device serial
  const liveCards = useMemo(() => {
    if (!data) return [];
    return data.warehouses
      .map((warehouse) => {
        const device = warehouse.devices.find((d) => d.isActive);
        if (!device) return null;
        const tempData = temperatureMap[device.serialNumber];
        if (!tempData) return null;
        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          temperature: tempData.temp,
          unit: tempData.unit,
          deviceSerialNumber: tempData.sn,
          lastUpdate: tempData.ts,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [data, temperatureMap]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const atRiskVariant = metrics.atRisk.total === 0 ? "success" : "danger";
  const freshnessVariant =
    metrics.dataFreshness.staleCount === 0
      ? "success"
      : metrics.dataFreshness.staleCount <= 2
        ? "warning"
        : "danger";

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Temperature Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring for your warehouses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Devices"
          icon={Radio}
          primaryMetric={`${String(metrics.activeDevices.total)} devices`}
          secondaryDetail={`${String(metrics.activeDevices.online)} online • ${String(metrics.activeDevices.offline)} offline`}
          variant={metrics.activeDevices.offline > 0 ? "danger" : "success"}
        />
        <KpiCard
          title="Warehouses at Risk"
          icon={AlertTriangle}
          primaryMetric={
            metrics.atRisk.total === 0
              ? "All clear"
              : `${String(metrics.atRisk.total)} warehouse${metrics.atRisk.total !== 1 ? "s" : ""}`
          }
          secondaryDetail={
            metrics.atRisk.total === 0
              ? "No temperature issues"
              : `${String(metrics.atRisk.critical)} critical • ${String(metrics.atRisk.warning)} warning`
          }
          variant={atRiskVariant}
        />
        <KpiCard
          title="Data Freshness"
          icon={Clock}
          primaryMetric={
            metrics.dataFreshness.staleCount === 0
              ? "All fresh"
              : `${String(metrics.dataFreshness.staleCount)} warehouse${metrics.dataFreshness.staleCount !== 1 ? "s" : ""}`
          }
          secondaryDetail={
            metrics.dataFreshness.staleCount === 0 ? "All data current" : "No updates for 10+ sec"
          }
          variant={freshnessVariant}
        />
        <KpiCard
          title="Average System Temp"
          icon={Thermometer}
          primaryMetric={
            metrics.averageTemp.value === null ? "—" : `${metrics.averageTemp.value.toFixed(1)}°C`
          }
          secondaryDetail={`Across ${String(metrics.averageTemp.sensorCount)} sensor${metrics.averageTemp.sensorCount !== 1 ? "s" : ""}`}
          variant={
            metrics.averageTemp.status === "green"
              ? "success"
              : metrics.averageTemp.status === "orange"
                ? "warning"
                : metrics.averageTemp.status === "red"
                  ? "danger"
                  : "default"
          }
        />
      </div>

      {/* Live Temperature Grid */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Live Temperature</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {liveCards.length === 0 ? (
            <div className="text-muted-foreground col-span-full text-center">
              Waiting for temperature data...
            </div>
          ) : (
            liveCards.map((card) => (
              <ConcessionaireTemperatureCard
                key={card.warehouseId}
                warehouseName={card.warehouseName}
                deviceSerialNumber={card.deviceSerialNumber}
                temperature={card.temperature}
                unit={card.unit}
                lastUpdate={card.lastUpdate}
              />
            ))
          )}
        </div>
      </div>

      {/* Time-series Chart */}
      <TemperatureTimeseriesCard initialConcessId={concessId} />

      {/* Breach Log */}
      <BreachLogTable concessId={concessId} />
    </div>
  );
}
