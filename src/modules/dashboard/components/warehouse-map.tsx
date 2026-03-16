import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useMemo } from "react";

import { env } from "@/lib/env";

import type { WarehouseTemperatureAggregate } from "../hooks/use-warehouse-temperatures";

interface WarehouseMapProps {
  warehouses: WarehouseTemperatureAggregate[];
}

const STATUS_COLORS = {
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  gray: "#9ca3af",
} as const;

const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return "No data";

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${String(diffMins)} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${String(diffHours)} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${String(diffDays)} day${diffDays > 1 ? "s" : ""} ago`;
};

export function WarehouseMap({ warehouses }: WarehouseMapProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  // Calculate center and zoom to fit all warehouses
  const { center, zoom } = useMemo(() => {
    if (warehouses.length === 0) {
      return { center: { lat: -6.2, lng: 106.8 }, zoom: 10 };
    }

    const bounds = {
      north: Math.max(...warehouses.map((w) => w.latitude)),
      south: Math.min(...warehouses.map((w) => w.latitude)),
      east: Math.max(...warehouses.map((w) => w.longitude)),
      west: Math.min(...warehouses.map((w) => w.longitude)),
    };

    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;

    return { center: { lat: centerLat, lng: centerLng }, zoom: 12 };
  }, [warehouses]);

  if (warehouses.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        No warehouses to display
      </div>
    );
  }

  return (
    <APIProvider apiKey={env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        mapId="warehouse-temperature-map"
        style={{ width: "100%", height: "100%" }}
        disableDefaultUI={false}
        gestureHandling="greedy"
      >
        {warehouses.map((warehouse) => (
          <AdvancedMarker
            key={warehouse.warehouseId}
            position={{ lat: warehouse.latitude, lng: warehouse.longitude }}
            onClick={() => {
              setSelectedWarehouse(warehouse.warehouseId);
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: STATUS_COLORS[warehouse.status],
                border: "2px solid white",
                cursor: "pointer",
              }}
            />
          </AdvancedMarker>
        ))}

        {selectedWarehouse &&
          (() => {
            const warehouse = warehouses.find((w) => w.warehouseId === selectedWarehouse);
            if (!warehouse) return null;

            return (
              <InfoWindow
                position={{
                  lat: warehouse.latitude,
                  lng: warehouse.longitude,
                }}
                onCloseClick={() => {
                  setSelectedWarehouse(null);
                }}
              >
                <div className="p-2">
                  <h3 className="font-semibold">{warehouse.warehouseName}</h3>
                  <p className="text-muted-foreground text-sm">{warehouse.concessionaireName}</p>
                  <hr className="my-2" />
                  {warehouse.averageTemperature !== null ? (
                    <>
                      <p className="text-lg font-bold">
                        🌡️ {warehouse.averageTemperature.toFixed(1)}°{warehouse.unit} (Average)
                      </p>
                      <p className="text-muted-foreground text-sm">📍 {warehouse.address}</p>
                      <p className="text-muted-foreground text-sm">
                        📊 {warehouse.reportingDeviceCount}/{warehouse.deviceCount} devices
                        reporting
                      </p>
                      <p className="text-muted-foreground text-sm">
                        🕐 Updated: {formatTimestamp(warehouse.lastUpdate)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">⚠️ No temperature data</p>
                      <p className="text-muted-foreground text-sm">📍 {warehouse.address}</p>
                      <p className="text-muted-foreground text-sm">
                        📊 {warehouse.reportingDeviceCount}/{warehouse.deviceCount} devices
                        reporting
                      </p>
                    </>
                  )}
                </div>
              </InfoWindow>
            );
          })()}
      </Map>
    </APIProvider>
  );
}
