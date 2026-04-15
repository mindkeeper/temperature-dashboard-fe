import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet";

import type { WarehouseTemperatureAggregate } from "../hooks/use-warehouse-temperatures";

import "leaflet/dist/leaflet.css";
import "./warehouse-map.css";

interface WarehouseMapProps {
  warehouses: WarehouseTemperatureAggregate[];
  filter?: "offlineDevices" | "atRisk" | "staleData" | null;
}

const STALE_THRESHOLD_MS = 10 * 1000;

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

// Inner component that has access to the Leaflet map instance via useMap()
interface MapInnerProps {
  filteredWarehouses: WarehouseTemperatureAggregate[];
  selectedWarehouse: string | null;
  onSelectWarehouse: (id: string | null) => void;
  onPopupPosition: (pos: { x: number; y: number } | null) => void;
}

function MapInner({
  filteredWarehouses,
  selectedWarehouse,
  onSelectWarehouse,
  onPopupPosition,
}: MapInnerProps) {
  const map = useMap();
  const markerClickedRef = useRef(false);

  // Recompute popup screen position on map move/zoom
  const updatePopupPosition = useCallback(() => {
    if (!selectedWarehouse) {
      onPopupPosition(null);
      return;
    }
    const warehouse = filteredWarehouses.find((w) => w.warehouseId === selectedWarehouse);
    if (!warehouse) {
      onPopupPosition(null);
      return;
    }
    const containerPoint = map.latLngToContainerPoint([warehouse.latitude, warehouse.longitude]);
    const container = map.getContainer();
    const { clientWidth, clientHeight } = container;
    if (
      containerPoint.x < 0 ||
      containerPoint.x > clientWidth ||
      containerPoint.y < 0 ||
      containerPoint.y > clientHeight
    ) {
      onPopupPosition(null);
      return;
    }
    onPopupPosition({ x: containerPoint.x, y: containerPoint.y });
  }, [selectedWarehouse, filteredWarehouses, map, onPopupPosition]);

  // Also compute on initial render and when selection changes
  useEffect(() => {
    updatePopupPosition();
  }, [updatePopupPosition]);

  useMapEvents({
    move: updatePopupPosition,
    zoom: updatePopupPosition,
    click: () => {
      if (markerClickedRef.current) {
        markerClickedRef.current = false;
        return;
      }
      onSelectWarehouse(null);
    },
  });

  return (
    <>
      {filteredWarehouses.map((warehouse) => (
        <CircleMarker
          key={warehouse.warehouseId}
          center={[warehouse.latitude, warehouse.longitude]}
          radius={12}
          pathOptions={{
            fillColor: STATUS_COLORS[warehouse.status],
            fillOpacity: 1,
            color: "white",
            weight: 2,
          }}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              markerClickedRef.current = true;
              onSelectWarehouse(warehouse.warehouseId);
            },
          }}
        />
      ))}
    </>
  );
}

export function WarehouseMap({ warehouses, filter = null }: WarehouseMapProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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

  const center = useMemo((): [number, number] => {
    return [-2.5489, 118.0149];
  }, []);

  const selectedWarehouseData = useMemo(
    () => filteredWarehouses.find((w) => w.warehouseId === selectedWarehouse),
    [filteredWarehouses, selectedWarehouse]
  );

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
      <MapContainer
        center={center}
        zoom={4.2}
        style={{ width: "100%", height: "100%" }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          minZoom={1}
          maxZoom={19}
        />
        <MapInner
          filteredWarehouses={filteredWarehouses}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={setSelectedWarehouse}
          onPopupPosition={setPopupPosition}
        />
      </MapContainer>

      {selectedWarehouseData && popupPosition && (
        <div
          className="warehouse-map-popup"
          style={{
            position: "absolute",
            left: popupPosition.x,
            top: popupPosition.y,
            transform: "translate(-50%, -100%)",
            marginTop: -15,
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <div className="mapboxgl-popup-content">
            <div className="warehouse-map-popup-header">
              <div>
                <h3 className="font-semibold">{selectedWarehouseData.warehouseName}</h3>
                <p className="text-muted-foreground text-sm">
                  {selectedWarehouseData.concessionaireName}
                </p>
              </div>
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
            </div>
            <hr className="warehouse-map-popup-divider" />
            <div className="warehouse-map-popup-body">
              <PopupTemperatureBody warehouse={selectedWarehouseData} />
            </div>
          </div>
          <div className="warehouse-map-popup-tip" />
        </div>
      )}
    </div>
  );
}
