import { AlertTriangle, Clock, Radio, Thermometer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAllConcessionaires } from "../hooks/use-concessionaire";
import { useKpiMetrics } from "../hooks/use-kpi-metrics";
import { useTemperature } from "../hooks/use-temperature";
import { useWarehouseTemperatures } from "../hooks/use-warehouse-temperatures";

import { KpiCard } from "./kpi-card";
import { TemperatureTimeseriesCard } from "./temperature-timeseries-card";
import { WarehouseMap } from "./warehouse-map";

type FilterType = "offlineDevices" | "atRisk" | "staleData" | null;

export function HeadOfficeDashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time every 30 seconds for freshness checks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Fetch all concessionaires with warehouses
  const { data: concessionairesData, isLoading, error } = useAllConcessionaires({ limit: 100 });
  const concessionaires = useMemo(() => concessionairesData?.data ?? [], [concessionairesData]);

  // Get real-time temperature data from WebSocket
  const { data: temperatureMap = {} } = useTemperature();

  // Aggregate warehouse-level temperatures
  const warehouseTemperatures = useWarehouseTemperatures(
    concessionaires,
    temperatureMap,
    currentTime
  );

  // Calculate KPI metrics (pass current time for freshness check)
  const metrics = useKpiMetrics(warehouseTemperatures, currentTime);

  const toggleFilter = (filter: FilterType) => {
    setActiveFilter((current) => (current === filter ? null : filter));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <div className="text-muted-foreground">Loading warehouses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold">Failed to load warehouses</p>
          <p className="text-muted-foreground text-sm">{String(error)}</p>
        </div>
      </div>
    );
  }

  const atRiskVariant = metrics.atRisk.total === 0 ? "success" : "danger";
  const freshnessVariant =
    metrics.dataFreshness.staleCount === 0
      ? "success"
      : metrics.dataFreshness.staleCount <= 3
        ? "warning"
        : "danger";

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col gap-4 overflow-auto p-4">
      {/* KPI Cards Row - Full Width */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Devices"
          icon={Radio}
          primaryMetric={`${String(metrics.activeDevices.total)} devices`}
          secondaryDetail={`${String(metrics.activeDevices.online)} online • ${String(metrics.activeDevices.offline)} offline`}
          variant="default"
          onClick={() => {
            toggleFilter("offlineDevices");
          }}
          isActive={activeFilter === "offlineDevices"}
          activeLabel="Viewing offline devices"
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
              : metrics.atRisk.offlineAtRisk > 0
                ? `${String(metrics.atRisk.critical)} critical • ${String(metrics.atRisk.warning)} warning • ${String(metrics.atRisk.offlineAtRisk)} offline`
                : `${String(metrics.atRisk.critical)} critical • ${String(metrics.atRisk.warning)} warning`
          }
          variant={atRiskVariant}
          onClick={() => {
            toggleFilter("atRisk");
          }}
          isActive={activeFilter === "atRisk"}
          activeLabel="Viewing at-risk warehouses"
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
          onClick={() => {
            toggleFilter("staleData");
          }}
          isActive={activeFilter === "staleData"}
          activeLabel="Viewing stale warehouses"
        />

        <KpiCard
          title="Average System Temp"
          icon={Thermometer}
          primaryMetric={
            metrics.averageTemp.value === null ? "—" : `${metrics.averageTemp.value.toFixed(1)}°C`
          }
          secondaryDetail={`Across ${metrics.averageTemp.sensorCount.toString()} sensor${metrics.averageTemp.sensorCount !== 1 ? "s" : ""}`}
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

      {/* Row 1: Map + Coming Soon */}
      <div className="grid h-96 shrink-0 grid-cols-1 gap-4 md:grid-cols-2">
        {/* Warehouse Map */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Warehouse Map</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Monitoring {warehouseTemperatures.length} warehouse
                {warehouseTemperatures.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" title="WebSocket connected" />
              <span className="text-muted-foreground text-sm">Live</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <WarehouseMap warehouses={warehouseTemperatures} filter={activeFilter} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="flex flex-1 items-center justify-center p-6">
            <p className="text-muted-foreground text-lg font-medium">Coming Soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Temperature Timeseries */}
      <TemperatureTimeseriesCard />

      {/* Row 3: Coming Soon Cards */}
      <div className="grid h-96 shrink-0 grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardContent className="flex flex-1 items-center justify-center p-6">
            <p className="text-muted-foreground text-lg font-medium">Coming Soon</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="flex flex-1 items-center justify-center p-6">
            <p className="text-muted-foreground text-lg font-medium">Coming Soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
