import { useMemo } from "react";

import { useAllConcessionaires } from "../hooks/use-concessionaire";
import { useTemperature } from "../hooks/use-temperature";
import { useWarehouseTemperatures } from "../hooks/use-warehouse-temperatures";

import { WarehouseMap } from "./warehouse-map";

export function HeadOfficeDashboard() {
  // Fetch all concessionaires with warehouses (500 per page)
  const { data: concessionairesData, isLoading, error } = useAllConcessionaires({ limit: 500 });
  const concessionaires = useMemo(() => concessionairesData?.data ?? [], [concessionairesData]);

  // Get real-time temperature data from WebSocket
  const { data: temperatureMap = {} } = useTemperature();

  // Aggregate warehouse-level temperatures
  const warehouseTemperatures = useWarehouseTemperatures(concessionaires, temperatureMap);

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

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Head Office Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Monitoring {warehouseTemperatures.length} warehouse
              {warehouseTemperatures.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" title="WebSocket connected" />
            <span className="text-muted-foreground text-sm">Live</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <WarehouseMap warehouses={warehouseTemperatures} />
      </div>
    </div>
  );
}
