import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";
import { useMemo, useState } from "react";

import { env } from "@/lib/env";

import type { WarehouseTemperatureAggregate } from "../hooks/use-warehouse-temperatures";

interface WarehouseMapProps {
  warehouses: WarehouseTemperatureAggregate[];
  filter?: "offlineDevices" | "atRisk" | "staleData" | null;
}

const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

const getPinColor = (status: string): string => {
  switch (status) {
    case "green":
      return "#22c55e";
    case "orange":
      return "#f97316";
    case "red":
      return "#ef4444";
    default:
      return "#9ca3af";
  }
};

export function WarehouseMap({ warehouses, filter = null }: WarehouseMapProps) {
  const [initialTime] = useState(() => Date.now());

  const filteredWarehouses = useMemo(() => {
    if (!filter) return warehouses;

    const currentTime = initialTime;

    switch (filter) {
      case "offlineDevices":
        return warehouses.filter((w) => w.deviceCount > w.reportingDeviceCount);
      case "atRisk":
        return warehouses.filter((w) => w.status === "orange" || w.status === "red");
      case "staleData":
        return warehouses.filter(
          (w) => w.lastUpdate === null || currentTime - w.lastUpdate > STALE_THRESHOLD_MS
        );
      default:
        return warehouses;
    }
  }, [warehouses, filter, initialTime]);

  const center = useMemo(() => {
    if (filteredWarehouses.length === 0) {
      return { lat: -2.5, lng: 118.0 }; // Indonesia center
    }
    const avgLat =
      filteredWarehouses.reduce((sum, w) => sum + w.latitude, 0) / filteredWarehouses.length;
    const avgLng =
      filteredWarehouses.reduce((sum, w) => sum + w.longitude, 0) / filteredWarehouses.length;
    return { lat: avgLat, lng: avgLng };
  }, [filteredWarehouses]);

  return (
    <APIProvider apiKey={env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={5}
        mapId={env.VITE_GOOGLE_MAPS_MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI={true}
        style={{ width: "100%", height: "100%" }}
      >
        {filteredWarehouses.map((warehouse) => (
          <AdvancedMarker
            key={warehouse.warehouseId}
            position={{ lat: warehouse.latitude, lng: warehouse.longitude }}
            title={warehouse.warehouseName}
          >
            <Pin
              background={getPinColor(warehouse.status)}
              borderColor="#1f2937"
              glyphColor="#ffffff"
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
