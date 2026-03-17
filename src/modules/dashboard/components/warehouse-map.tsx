import { useState, useMemo, useRef, useEffect } from "react";
import Map, { Marker, Popup, type MapRef } from "react-map-gl/mapbox";

import { env } from "@/lib/env";

import type { WarehouseTemperatureAggregate } from "../hooks/use-warehouse-temperatures";

import "mapbox-gl/dist/mapbox-gl.css";
import "./warehouse-map.css";

interface WarehouseMapProps {
  warehouses: WarehouseTemperatureAggregate[];
  filter?: "offlineDevices" | "atRisk" | "staleData" | null;
}

const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

const STATUS_COLORS = {
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  gray: "#9ca3af",
} as const;

const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return "No data";

  // Convert Unix timestamp (seconds) to milliseconds
  const timestampMs = timestamp * 1000;
  const now = Date.now();
  const diffMs = now - timestampMs;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${String(diffMins)} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${String(diffHours)} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${String(diffDays)} day${diffDays > 1 ? "s" : ""} ago`;
};

export function WarehouseMap({ warehouses, filter = null }: WarehouseMapProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [initialTime] = useState(() => Date.now());
  const mapRef = useRef<MapRef>(null);

  // Filter warehouses based on active filter
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

  // Calculate center and initial viewport
  const initialViewState = useMemo(() => {
    if (filteredWarehouses.length === 0) {
      // Center of Indonesia with zoom to see entire country
      return {
        latitude: -2.5,
        longitude: 118.0,
        zoom: 0,
      };
    }

    const bounds = {
      north: Math.max(...filteredWarehouses.map((w) => w.latitude)),
      south: Math.min(...filteredWarehouses.map((w) => w.latitude)),
      east: Math.max(...filteredWarehouses.map((w) => w.longitude)),
      west: Math.min(...filteredWarehouses.map((w) => w.longitude)),
    };

    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      zoom: 4,
    };
  }, [filteredWarehouses]);

  // Auto-fit bounds when warehouses change
  useEffect(() => {
    if (mapRef.current && filteredWarehouses.length > 1) {
      const bounds: [number, number, number, number] = [
        Math.min(...filteredWarehouses.map((w) => w.longitude)), // west
        Math.min(...filteredWarehouses.map((w) => w.latitude)), // south
        Math.max(...filteredWarehouses.map((w) => w.longitude)), // east
        Math.max(...filteredWarehouses.map((w) => w.latitude)), // north
      ];

      mapRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      });
    }
  }, [filteredWarehouses]);

  if (filteredWarehouses.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        No warehouses to display
      </div>
    );
  }

  const selectedWarehouseData = filteredWarehouses.find((w) => w.warehouseId === selectedWarehouse);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={env.VITE_MAPBOX_ACCESS_TOKEN}
        interactiveLayerIds={[]}
        attributionControl={true}
        projection="mercator"
      >
        {filteredWarehouses.map((warehouse) => (
          <Marker
            key={warehouse.warehouseId}
            latitude={warehouse.latitude}
            longitude={warehouse.longitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
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
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </Marker>
        ))}

        {selectedWarehouseData && (
          <Popup
            latitude={selectedWarehouseData.latitude}
            longitude={selectedWarehouseData.longitude}
            onClose={() => {
              setSelectedWarehouse(null);
            }}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            offset={15}
          >
            <div className="p-2">
              <h3 className="font-semibold">{selectedWarehouseData.warehouseName}</h3>
              <p className="text-muted-foreground text-sm">
                {selectedWarehouseData.concessionaireName}
              </p>
              <hr className="my-2" />
              {selectedWarehouseData.averageTemperature !== null ? (
                <>
                  <p className="text-lg font-bold">
                    🌡️ {selectedWarehouseData.averageTemperature.toFixed(1)}°
                    {selectedWarehouseData.unit} (Average)
                  </p>
                  <p className="text-muted-foreground text-sm">{selectedWarehouseData.address}</p>
                  <p className="text-muted-foreground text-sm">
                    📊 {selectedWarehouseData.reportingDeviceCount}/
                    {selectedWarehouseData.deviceCount} devices reporting
                  </p>
                  <p className="text-muted-foreground text-sm">
                    🕐 Updated: {formatTimestamp(selectedWarehouseData.lastUpdate)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">⚠️ No temperature data</p>
                  <p className="text-muted-foreground text-sm">{selectedWarehouseData.address}</p>
                  <p className="text-muted-foreground text-sm">
                    📊 {selectedWarehouseData.reportingDeviceCount}/
                    {selectedWarehouseData.deviceCount} devices reporting
                  </p>
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
