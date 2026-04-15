# Mapbox to Leaflet Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `react-map-gl`/`mapbox-gl` with `react-leaflet`/`leaflet` in the HO dashboard warehouse map, using CartoDB Positron tiles, preserving all existing features and visual style.

**Architecture:** Drop-in replacement of `warehouse-map.tsx` — same props interface, same filtering logic, same custom popup (repositioned via Leaflet's `map.latLngToContainerPoint()`), same color-coded circular markers. The `env.ts` Mapbox token validation is made optional so it doesn't crash without the token.

**Tech Stack:** `react-leaflet` v4, `leaflet` v1, `@types/leaflet`, CartoDB Positron tile URL (no API key required)

---

### Task 1: Install react-leaflet and leaflet

**Files:**

- Modify: `package.json`

**Step 1: Install packages**

Run:

```bash
npm install react-leaflet leaflet
npm install --save-dev @types/leaflet
```

Expected: packages added to `node_modules`, `package.json` updated with `react-leaflet`, `leaflet`, `@types/leaflet`.

**Step 2: Verify install**

Run:

```bash
npm ls react-leaflet leaflet
```

Expected: both packages listed without errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install react-leaflet and leaflet"
```

---

### Task 2: Make VITE_MAPBOX_ACCESS_TOKEN optional in env.ts

**Files:**

- Modify: `src/lib/env.ts`

**Step 1: Read current env.ts**

The current schema has `VITE_MAPBOX_ACCESS_TOKEN: z.string()` which will throw at runtime if the token is missing. Since we're moving away from Mapbox, make it optional.

**Step 2: Update env.ts**

Change `src/lib/env.ts`:

```typescript
import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]),
  VITE_ENABLE_MSW: z.string().optional(),
  VITE_MAPBOX_ACCESS_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
```

**Step 3: Verify typecheck passes**

Run:

```bash
npm run typecheck
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/lib/env.ts
git commit -m "feat: make VITE_MAPBOX_ACCESS_TOKEN optional in env schema"
```

---

### Task 3: Rewrite warehouse-map.tsx using react-leaflet

**Files:**

- Modify: `src/modules/dashboard/components/warehouse-map.tsx`

**Step 1: Replace the full file content**

The key mapping from Mapbox → Leaflet:

| Mapbox concept                                | Leaflet equivalent                                                |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `import Map from "react-map-gl/mapbox"`       | `import { MapContainer, TileLayer, useMap } from "react-leaflet"` |
| `mapRef.current.fitBounds(bounds)`            | inner component via `useMap()` hook calls `map.fitBounds(bounds)` |
| `mapRef.current.project([lng, lat])`          | `map.latLngToContainerPoint([lat, lng])`                          |
| `mapRef.current.getMap()` / `map.getCanvas()` | `map.getContainer()`                                              |
| `<Marker latitude longitude>`                 | Custom `<CircleMarker>` or `<Marker>` with DivIcon                |
| `onMove`                                      | `useMapEvents({ move: handler })`                                 |
| `onClick` on map                              | `useMapEvents({ click: handler })`                                |
| `mapbox-gl/dist/mapbox-gl.css`                | `leaflet/dist/leaflet.css`                                        |
| CartoDB Positron URL                          | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`  |

**Step 2: Write the new warehouse-map.tsx**

```tsx
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";

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

  // Auto-fit bounds when filtered warehouses change
  useEffect(() => {
    if (filteredWarehouses.length > 1) {
      const lats = filteredWarehouses.map((w) => w.latitude);
      const lngs = filteredWarehouses.map((w) => w.longitude);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [50, 50], animate: true, duration: 1 }
      );
    }
  }, [filteredWarehouses, map]);

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
    if (filteredWarehouses.length === 0) return [-2.5, 118.0];
    const lats = filteredWarehouses.map((w) => w.latitude);
    const lngs = filteredWarehouses.map((w) => w.longitude);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }, [filteredWarehouses]);

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
        zoom={filteredWarehouses.length === 1 ? 10 : 4}
        style={{ width: "100%", height: "100%" }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
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
```

**Step 3: Verify typecheck passes**

Run:

```bash
npm run typecheck
```

Expected: no errors (Leaflet types fully cover all APIs used).

**Step 4: Commit**

```bash
git add src/modules/dashboard/components/warehouse-map.tsx
git commit -m "feat: replace mapbox with react-leaflet and CartoDB Positron tiles"
```

---

### Task 4: Update warehouse-map.css (rename Mapbox-specific class)

**Files:**

- Modify: `src/modules/dashboard/components/warehouse-map.css`

**Step 1: Update CSS**

The CSS uses `.mapboxgl-popup-close-button` and `.mapboxgl-popup-content` — these are custom classes we invented (not injected by Mapbox). They still work fine as-is since they're referenced in our JSX. No change needed.

However, Leaflet injects its own CSS which may add a gray box around `MapContainer`. Add a rule to ensure the Leaflet container fills its parent properly:

```css
/* Ensure Leaflet container fills parent */
.leaflet-container {
  width: 100%;
  height: 100%;
}
```

Append this to `warehouse-map.css`.

**Step 2: Verify no visual regressions by running the app**

Run:

```bash
npm run dev
```

Navigate to the HO dashboard and confirm:

- Map loads with CartoDB Positron (light gray style)
- Colored circle markers appear at warehouse locations
- Clicking a marker shows the popup with correct data
- Clicking the map closes the popup
- Popup repositions correctly on pan/zoom
- Popup auto-hides when marker is panned out of view

**Step 3: Commit**

```bash
git add src/modules/dashboard/components/warehouse-map.css
git commit -m "feat: add leaflet container fill rule to map CSS"
```

---

### Task 5: Update the test file to mock react-leaflet instead of react-map-gl

**Files:**

- Modify: `src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`

**Step 1: Replace the mock**

The test currently mocks `react-map-gl/mapbox`. Replace with a mock for `react-leaflet` that renders markers as `data-testid="map-marker"` divs — keeping the same test assertions.

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { WarehouseTemperatureAggregate } from "../../hooks/use-warehouse-temperatures";
import { WarehouseMap } from "../warehouse-map";

// Mock react-leaflet
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="leaflet-map">{children}</div>
  ),
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-marker">{children}</div>
  ),
  useMap: () => ({
    fitBounds: vi.fn(),
    latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
    getContainer: vi.fn(() => ({ clientWidth: 800, clientHeight: 600 })),
  }),
  useMapEvents: vi.fn(),
}));

// ... rest of test data and tests unchanged
```

**Step 2: Run tests to verify they all pass**

Run:

```bash
npm run test:run -- src/modules/dashboard/components/__tests__/warehouse-map.test.tsx
```

Expected: all 5 tests PASS.

**Step 3: Commit**

```bash
git add src/modules/dashboard/components/__tests__/warehouse-map.test.tsx
git commit -m "test: update warehouse-map tests to mock react-leaflet"
```

---

### Task 6: Final verification

**Step 1: Run full typecheck**

```bash
npm run typecheck
```

Expected: 0 errors.

**Step 2: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass.

**Step 3: Run lint**

```bash
npm run lint
```

Expected: 0 errors.

**Step 4: Build**

```bash
npm run build
```

Expected: successful build, no errors.
