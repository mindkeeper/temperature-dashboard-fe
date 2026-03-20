import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";

import { env } from "@/lib/env";

import type { WarehouseTemperatureAggregate } from "../hooks/use-warehouse-temperatures";

import "mapbox-gl/dist/mapbox-gl.css";
import "./warehouse-map.css";

interface WarehouseMapProps {
  warehouses: WarehouseTemperatureAggregate[];
  filter?: "offlineDevices" | "atRisk" | "staleData" | null;
}

const STALE_THRESHOLD_MS = 10 * 1000; // 10 seconds - aligned with KPI metrics

const getTemperatureStatus = (temp: number): "green" | "orange" | "red" => {
  if (temp <= -20) return "green";
  if (temp <= -11) return "orange";
  return "red";
};

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

function PopupTemperatureBody({ warehouse }: { warehouse: WarehouseTemperatureAggregate }) {
  if (warehouse.averageTemperature !== null) {
    return (
      <>
        <p className="text-lg font-bold">
          🌡️ {warehouse.averageTemperature.toFixed(1)}°{warehouse.unit} (Average)
        </p>
        <p className="text-muted-foreground text-sm">{warehouse.address}</p>
        <p className="text-muted-foreground text-sm">
          📊 {warehouse.reportingDeviceCount}/{warehouse.deviceCount} devices reporting
        </p>
        <p className="text-muted-foreground text-sm">
          🕐 Updated: {formatTimestamp(warehouse.lastUpdate)}
        </p>
      </>
    );
  }

  if (warehouse.lastKnownAverageTemperature !== null) {
    const lastKnown = warehouse.lastKnownAverageTemperature;
    return (
      <>
        <p className="text-sm font-medium">⚠️ All devices offline</p>
        <p className="text-muted-foreground text-sm">{warehouse.address}</p>
        <p className="text-muted-foreground text-sm">
          📊 0/{warehouse.deviceCount} devices reporting
        </p>
        <p className="text-muted-foreground text-sm">
          🌡️ Last reported: {lastKnown.toFixed(1)}°{warehouse.unit}
        </p>
        <p className="text-muted-foreground text-sm">
          🕐 Last update: {formatTimestamp(warehouse.lastUpdate)}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="text-sm">⚠️ No temperature data</p>
      <p className="text-muted-foreground text-sm">{warehouse.address}</p>
      <p className="text-muted-foreground text-sm">
        📊 {warehouse.reportingDeviceCount}/{warehouse.deviceCount} devices reporting
      </p>
    </>
  );
}

export function WarehouseMap({ warehouses, filter = null }: WarehouseMapProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [mapMoveCount, setMapMoveCount] = useState(0);
  const mapRef = useRef<MapRef>(null);

  // Update current time periodically to keep staleness check accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second for accurate staleness detection

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Filter warehouses based on active filter
  const filteredWarehouses = useMemo(() => {
    if (!filter) return warehouses;

    const now = currentTime;

    switch (filter) {
      case "offlineDevices":
        return warehouses.filter((w) => w.deviceCount > w.reportingDeviceCount);
      case "atRisk":
        return warehouses.filter((w) => {
          if (w.status === "orange" || w.status === "red") return true;
          if (w.status === "gray" && w.lastKnownAverageTemperature !== null) {
            const lastStatus = getTemperatureStatus(w.lastKnownAverageTemperature);
            return lastStatus === "orange" || lastStatus === "red";
          }
          return false;
        });
      case "staleData":
        return warehouses.filter(
          (w) => w.lastUpdate === null || now - w.lastUpdate > STALE_THRESHOLD_MS
        );
      default:
        return warehouses;
    }
  }, [warehouses, filter, currentTime]);

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

  const selectedWarehouseData = useMemo(
    () => filteredWarehouses.find((w) => w.warehouseId === selectedWarehouse),
    [filteredWarehouses, selectedWarehouse]
  );

  // Compute popup screen position from lat/lng using the map's project() method.
  // Re-computed whenever the selected warehouse or map viewport changes (via mapMoveCount).
  // Auto-closes popup when the pin is panned/zoomed out of the visible map area.
  const popupPosition = useMemo(() => {
    if (!selectedWarehouseData || !mapRef.current) return null;

    const map = mapRef.current.getMap();
    const canvas = map.getCanvas();
    const point = mapRef.current.project([
      selectedWarehouseData.longitude,
      selectedWarehouseData.latitude,
    ]);

    // Close popup if the pin is outside the visible map area
    const mapWidth = canvas.clientWidth;
    const mapHeight = canvas.clientHeight;
    if (point.x < 0 || point.x > mapWidth || point.y < 0 || point.y > mapHeight) {
      return null;
    }

    return { x: point.x, y: point.y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouseData, mapMoveCount]);

  // Trigger re-computation of popup position on map move/zoom
  const handleMapMove = useCallback(() => {
    if (selectedWarehouse) {
      setMapMoveCount((c) => c + 1);
    }
  }, [selectedWarehouse]);

  // Close popup when clicking on the map (but not on a marker or the popup itself)
  const handleMapClick = useCallback(() => {
    setSelectedWarehouse(null);
  }, []);

  if (filteredWarehouses.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        No warehouses to display
      </div>
    );
  }

  return (
    <div
      className="warehouse-map-container"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={env.VITE_MAPBOX_ACCESS_TOKEN}
        interactiveLayerIds={[]}
        attributionControl={true}
        projection="mercator"
        onMove={handleMapMove}
        onClick={handleMapClick}
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
              data-marker
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
      </Map>

      {/* Custom popup rendered outside the Map to avoid overflow clipping */}
      {selectedWarehouseData && popupPosition && (
        <div
          className="warehouse-map-popup"
          style={{
            position: "absolute",
            left: popupPosition.x,
            top: popupPosition.y,
            transform: "translate(-50%, -100%)",
            marginTop: -15,
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          <div className="mapboxgl-popup-content">
            <button
              className="mapboxgl-popup-close-button"
              type="button"
              aria-label="Close popup"
              onClick={() => {
                setSelectedWarehouse(null);
              }}
            >
              ×
            </button>
            <div className="p-2">
              <h3 className="font-semibold">{selectedWarehouseData.warehouseName}</h3>
              <p className="text-muted-foreground text-sm">
                {selectedWarehouseData.concessionaireName}
              </p>
              <hr className="my-2" />
              <PopupTemperatureBody warehouse={selectedWarehouseData} />
            </div>
          </div>
          <div className="warehouse-map-popup-tip" />
        </div>
      )}
    </div>
  );
}
