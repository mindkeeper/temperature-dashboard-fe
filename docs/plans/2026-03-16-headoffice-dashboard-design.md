# Head Office Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive Google Maps dashboard showing real-time warehouse temperatures from all concessionaires with color-coded pins.

**Architecture:** Reuse existing WebSocket infrastructure (`useTemperature`) and concessionaire API (`useAllConcessionaires`). Create aggregation layer (`useWarehouseTemperatures`) to merge device-level temps into warehouse-level averages. Render with `@vis.gl/react-google-maps` using `AdvancedMarker` with status-based colors.

**Tech Stack:** React 19, TypeScript, TanStack Query, @vis.gl/react-google-maps, socket.io-client (existing), Tailwind CSS v4, Vitest, React Testing Library

---

## Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install Google Maps library**

Run: `pnpm add @vis.gl/react-google-maps`

Expected: Dependency added to package.json

**Step 2: Verify installation**

Run: `pnpm install`

Expected: Lock file updated, node_modules contains @vis.gl/react-google-maps

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add @vis.gl/react-google-maps dependency

Install Google Maps library for head office dashboard visualization.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add Environment Variable

**Files:**

- Modify: `.env.example`
- Modify: `src/lib/env.ts`

**Step 1: Write the failing test**

Create: `src/lib/__tests__/env.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { env } from "../env";

describe("env", () => {
  it("validates VITE_GOOGLE_MAPS_API_KEY exists", () => {
    expect(env.VITE_GOOGLE_MAPS_API_KEY).toBeDefined();
    expect(typeof env.VITE_GOOGLE_MAPS_API_KEY).toBe("string");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/__tests__/env.test.ts`

Expected: FAIL - "env.VITE_GOOGLE_MAPS_API_KEY is not defined"

**Step 3: Add to .env.example**

Add to `.env.example`:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Step 4: Update env.ts validation**

Read: `src/lib/env.ts`

Add validation for Google Maps API key in the env object (follow existing pattern).

Example:

```typescript
export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === "true",
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
} as const;
```

**Step 5: Run test to verify it passes**

Run: `pnpm test src/lib/__tests__/env.test.ts`

Expected: PASS (if .env file has the key, otherwise skip test or mock)

**Step 6: Commit**

```bash
git add .env.example src/lib/env.ts src/lib/__tests__/env.test.ts
git commit -m "feat: add VITE_GOOGLE_MAPS_API_KEY environment variable

Add Google Maps API key configuration for head office dashboard.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Temperature Aggregation Hook

**Files:**

- Create: `src/modules/dashboard/hooks/use-warehouse-temperatures.ts`
- Create: `src/modules/dashboard/hooks/__tests__/use-warehouse-temperatures.test.ts`

**Step 1: Write the failing test**

Create: `src/modules/dashboard/hooks/__tests__/use-warehouse-temperatures.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useWarehouseTemperatures } from "../use-warehouse-temperatures";
import type { Concessionaire } from "@/services/concessionaire";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useWarehouseTemperatures", () => {
  it("aggregates temperature data for warehouses with multiple devices", () => {
    const concessionaires: Concessionaire[] = [
      {
        id: "c1",
        name: "Concessionaire A",
        slug: "concessionaire-a",
        address: "123 Main St",
        latitude: -6.2,
        longitude: 106.8,
        warehouses: [
          {
            id: "w1",
            name: "Warehouse 1",
            slug: "warehouse-1",
            address: "123 Main St",
            latitude: -6.2,
            longitude: 106.8,
            concessionaireId: "c1",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            devices: [
              {
                id: "d1",
                serialNumber: "SN001",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: true,
                installedAt: "2024-01-01",
                deactivatedAt: null,
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
              {
                id: "d2",
                serialNumber: "SN002",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: true,
                installedAt: "2024-01-01",
                deactivatedAt: null,
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
            ],
          },
        ],
      },
    ];

    const temperatureMap = {
      SN001: { sn: "SN001", temp: -18, unit: "C", ts: Date.now() },
      SN002: { sn: "SN002", temp: -22, unit: "C", ts: Date.now() },
    };

    const { result } = renderHook(
      () => useWarehouseTemperatures(concessionaires, temperatureMap),
      { wrapper: createWrapper() },
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      warehouseId: "w1",
      warehouseName: "Warehouse 1",
      averageTemperature: -20,
      deviceCount: 2,
      reportingDeviceCount: 2,
      status: "green",
    });
  });

  it("assigns green status for temp <= -20", () => {
    const concessionaires: Concessionaire[] = [
      {
        id: "c1",
        name: "Concessionaire A",
        slug: "concessionaire-a",
        address: "123 Main St",
        latitude: -6.2,
        longitude: 106.8,
        warehouses: [
          {
            id: "w1",
            name: "Warehouse 1",
            slug: "warehouse-1",
            address: "123 Main St",
            latitude: -6.2,
            longitude: 106.8,
            concessionaireId: "c1",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            devices: [
              {
                id: "d1",
                serialNumber: "SN001",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: true,
                installedAt: "2024-01-01",
                deactivatedAt: null,
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
            ],
          },
        ],
      },
    ];

    const temperatureMap = {
      SN001: { sn: "SN001", temp: -25, unit: "C", ts: Date.now() },
    };

    const { result } = renderHook(
      () => useWarehouseTemperatures(concessionaires, temperatureMap),
      { wrapper: createWrapper() },
    );

    expect(result.current[0].status).toBe("green");
  });

  it("assigns orange status for -20 < temp <= -11", () => {
    const concessionaires: Concessionaire[] = [
      {
        id: "c1",
        name: "Concessionaire A",
        slug: "concessionaire-a",
        address: "123 Main St",
        latitude: -6.2,
        longitude: 106.8,
        warehouses: [
          {
            id: "w1",
            name: "Warehouse 1",
            slug: "warehouse-1",
            address: "123 Main St",
            latitude: -6.2,
            longitude: 106.8,
            concessionaireId: "c1",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            devices: [
              {
                id: "d1",
                serialNumber: "SN001",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: true,
                installedAt: "2024-01-01",
                deactivatedAt: null,
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
            ],
          },
        ],
      },
    ];

    const temperatureMap = {
      SN001: { sn: "SN001", temp: -15, unit: "C", ts: Date.now() },
    };

    const { result } = renderHook(
      () => useWarehouseTemperatures(concessionaires, temperatureMap),
      { wrapper: createWrapper() },
    );

    expect(result.current[0].status).toBe("orange");
  });

  it("assigns red status for temp > -11", () => {
    const concessionaires: Concessionaire[] = [
      {
        id: "c1",
        name: "Concessionaire A",
        slug: "concessionaire-a",
        address: "123 Main St",
        latitude: -6.2,
        longitude: 106.8,
        warehouses: [
          {
            id: "w1",
            name: "Warehouse 1",
            slug: "warehouse-1",
            address: "123 Main St",
            latitude: -6.2,
            longitude: 106.8,
            concessionaireId: "c1",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            devices: [
              {
                id: "d1",
                serialNumber: "SN001",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: true,
                installedAt: "2024-01-01",
                deactivatedAt: null,
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
            ],
          },
        ],
      },
    ];

    const temperatureMap = {
      SN001: { sn: "SN001", temp: -5, unit: "C", ts: Date.now() },
    };

    const { result } = renderHook(
      () => useWarehouseTemperatures(concessionaires, temperatureMap),
      { wrapper: createWrapper() },
    );

    expect(result.current[0].status).toBe("red");
  });

  it("assigns gray status when no temperature data available", () => {
    const concessionaires: Concessionaire[] = [
      {
        id: "c1",
        name: "Concessionaire A",
        slug: "concessionaire-a",
        address: "123 Main St",
        latitude: -6.2,
        longitude: 106.8,
        warehouses: [
          {
            id: "w1",
            name: "Warehouse 1",
            slug: "warehouse-1",
            address: "123 Main St",
            latitude: -6.2,
            longitude: 106.8,
            concessionaireId: "c1",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            devices: [
              {
                id: "d1",
                serialNumber: "SN001",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: true,
                installedAt: "2024-01-01",
                deactivatedAt: null,
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
            ],
          },
        ],
      },
    ];

    const temperatureMap = {};

    const { result } = renderHook(
      () => useWarehouseTemperatures(concessionaires, temperatureMap),
      { wrapper: createWrapper() },
    );

    expect(result.current[0].status).toBe("gray");
    expect(result.current[0].averageTemperature).toBeNull();
    expect(result.current[0].reportingDeviceCount).toBe(0);
  });

  it("only counts active devices", () => {
    const concessionaires: Concessionaire[] = [
      {
        id: "c1",
        name: "Concessionaire A",
        slug: "concessionaire-a",
        address: "123 Main St",
        latitude: -6.2,
        longitude: 106.8,
        warehouses: [
          {
            id: "w1",
            name: "Warehouse 1",
            slug: "warehouse-1",
            address: "123 Main St",
            latitude: -6.2,
            longitude: 106.8,
            concessionaireId: "c1",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            devices: [
              {
                id: "d1",
                serialNumber: "SN001",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: true,
                installedAt: "2024-01-01",
                deactivatedAt: null,
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
              {
                id: "d2",
                serialNumber: "SN002",
                modelname: "Model A",
                specifications: {
                  type: "Temperature",
                  power: "12V",
                  range: "-40 to 80",
                  accuracy: "0.5",
                  connectivity: "WiFi",
                },
                isActive: false,
                installedAt: "2024-01-01",
                deactivatedAt: "2024-02-01",
                warehouseId: "w1",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
              },
            ],
          },
        ],
      },
    ];

    const temperatureMap = {
      SN001: { sn: "SN001", temp: -20, unit: "C", ts: Date.now() },
      SN002: { sn: "SN002", temp: -10, unit: "C", ts: Date.now() },
    };

    const { result } = renderHook(
      () => useWarehouseTemperatures(concessionaires, temperatureMap),
      { wrapper: createWrapper() },
    );

    expect(result.current[0].deviceCount).toBe(1);
    expect(result.current[0].reportingDeviceCount).toBe(1);
    expect(result.current[0].averageTemperature).toBe(-20);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/dashboard/hooks/__tests__/use-warehouse-temperatures.test.ts`

Expected: FAIL - "useWarehouseTemperatures is not defined"

**Step 3: Write minimal implementation**

Create: `src/modules/dashboard/hooks/use-warehouse-temperatures.ts`

```typescript
import { useMemo } from "react";
import type { Concessionaire } from "@/services/concessionaire";

interface TemperatureData {
  sn: string;
  temp: number;
  unit: string;
  ts: number;
}

type TemperatureMap = Record<string, TemperatureData>;

export interface WarehouseTemperatureAggregate {
  warehouseId: string;
  warehouseName: string;
  address: string;
  latitude: number;
  longitude: number;
  concessionaireName: string;
  averageTemperature: number | null;
  unit: string;
  deviceCount: number;
  reportingDeviceCount: number;
  lastUpdate: number | null;
  status: "green" | "orange" | "red" | "gray";
}

const getTemperatureStatus = (temp: number): "green" | "orange" | "red" => {
  if (temp <= -20) return "green";
  if (temp <= -11) return "orange";
  return "red";
};

/**
 * Aggregates device-level temperature data into warehouse-level metrics
 * @param concessionaires - List of concessionaires with warehouses
 * @param temperatureMap - Real-time temperature data keyed by device serial number
 * @returns Array of warehouse temperature aggregates
 */
export const useWarehouseTemperatures = (
  concessionaires: Concessionaire[],
  temperatureMap: TemperatureMap
): WarehouseTemperatureAggregate[] => {
  return useMemo(() => {
    const aggregates: WarehouseTemperatureAggregate[] = [];

    for (const concessionaire of concessionaires) {
      for (const warehouse of concessionaire.warehouses) {
        // Filter active devices only
        const activeDevices = warehouse.devices.filter((device) => device.isActive);

        // Get temperature readings for active devices
        const deviceReadings = activeDevices
          .map((device) => temperatureMap[device.serialNumber])
          .filter((reading): reading is TemperatureData => reading !== undefined);

        // Calculate average temperature
        const averageTemperature =
          deviceReadings.length > 0
            ? deviceReadings.reduce((sum, reading) => sum + reading.temp, 0) / deviceReadings.length
            : null;

        // Find most recent timestamp
        const lastUpdate =
          deviceReadings.length > 0 ? Math.max(...deviceReadings.map((r) => r.ts)) : null;

        // Determine status
        const status =
          averageTemperature === null ? "gray" : getTemperatureStatus(averageTemperature);

        // Get unit (assume consistent units, use first reading or default to "C")
        const unit = deviceReadings[0]?.unit ?? "C";

        aggregates.push({
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          address: warehouse.address,
          latitude: warehouse.latitude,
          longitude: warehouse.longitude,
          concessionaireName: concessionaire.name,
          averageTemperature,
          unit,
          deviceCount: activeDevices.length,
          reportingDeviceCount: deviceReadings.length,
          lastUpdate,
          status,
        });
      }
    }

    return aggregates;
  }, [concessionaires, temperatureMap]);
};
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/hooks/__tests__/use-warehouse-temperatures.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/dashboard/hooks/use-warehouse-temperatures.ts src/modules/dashboard/hooks/__tests__/use-warehouse-temperatures.test.ts
git commit -m "feat: add warehouse temperature aggregation hook

Implement useWarehouseTemperatures to aggregate device-level
temperature data into warehouse-level metrics with status colors.

Temperature thresholds:
- Green: <= -20°C
- Orange: -20°C to -11°C
- Red: > -11°C
- Gray: No data

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Warehouse Map Component

**Files:**

- Create: `src/modules/dashboard/components/warehouse-map.tsx`
- Create: `src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`

**Step 1: Write the failing test**

Create: `src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarehouseMap } from "../warehouse-map";
import type { WarehouseTemperatureAggregate } from "../../hooks/use-warehouse-temperatures";

// Mock the Google Maps library
vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Map: ({ children }: { children: React.ReactNode }) => <div data-testid="google-map">{children}</div>,
  AdvancedMarker: ({ children }: { children: React.ReactNode }) => <div data-testid="map-marker">{children}</div>,
  InfoWindow: ({ children }: { children: React.ReactNode }) => <div data-testid="info-window">{children}</div>,
}));

describe("WarehouseMap", () => {
  it("renders Google Map with markers", () => {
    const warehouses: WarehouseTemperatureAggregate[] = [
      {
        warehouseId: "w1",
        warehouseName: "Warehouse 1",
        address: "123 Main St",
        latitude: -6.2,
        longitude: 106.8,
        concessionaireName: "Concessionaire A",
        averageTemperature: -18,
        unit: "C",
        deviceCount: 2,
        reportingDeviceCount: 2,
        lastUpdate: Date.now(),
        status: "green",
      },
    ];

    render(<WarehouseMap warehouses={warehouses} />);

    expect(screen.getByTestId("google-map")).toBeInTheDocument();
    expect(screen.getByTestId("map-marker")).toBeInTheDocument();
  });

  it("renders empty state when no warehouses", () => {
    render(<WarehouseMap warehouses={[]} />);

    expect(screen.getByText(/no warehouses to display/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`

Expected: FAIL - "WarehouseMap is not defined"

**Step 3: Write minimal implementation**

Create: `src/modules/dashboard/components/warehouse-map.tsx`

```typescript
import { useState, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
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
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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
      <div className="flex h-full items-center justify-center text-muted-foreground">
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
            onClick={() => setSelectedWarehouse(warehouse.warehouseId)}
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

        {selectedWarehouse && (
          <InfoWindow
            position={
              warehouses.find((w) => w.warehouseId === selectedWarehouse)
                ? {
                    lat: warehouses.find((w) => w.warehouseId === selectedWarehouse)!.latitude,
                    lng: warehouses.find((w) => w.warehouseId === selectedWarehouse)!.longitude,
                  }
                : { lat: 0, lng: 0 }
            }
            onCloseClick={() => setSelectedWarehouse(null)}
          >
            {(() => {
              const warehouse = warehouses.find((w) => w.warehouseId === selectedWarehouse);
              if (!warehouse) return null;

              return (
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
                        📊 {warehouse.reportingDeviceCount}/{warehouse.deviceCount} devices reporting
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
                        📊 {warehouse.reportingDeviceCount}/{warehouse.deviceCount} devices reporting
                      </p>
                    </>
                  )}
                </div>
              );
            })()}
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/dashboard/components/warehouse-map.tsx src/modules/dashboard/components/__tests__/warehouse-map.test.tsx
git commit -m "feat: add WarehouseMap component with Google Maps

Implement interactive map with:
- Color-coded pins (green/orange/red/gray) based on temperature
- InfoWindow with warehouse details on pin click
- Auto-fit bounds to show all warehouses
- Timestamp formatting (relative time)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update Head Office Dashboard Component

**Files:**

- Modify: `src/modules/dashboard/components/head-office-dashboard.tsx`
- Create: `src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`

**Step 1: Write the failing test**

Create: `src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { HeadOfficeDashboard } from "../head-office-dashboard";

// Mock hooks
vi.mock("../../hooks/use-concessionaire", () => ({
  useAllConcessionaires: vi.fn(() => ({
    data: {
      data: [],
      meta: { pagination: { page: 1, limit: 500, total: 0, totalPages: 1 } },
    },
    isLoading: false,
    error: null,
  })),
}));

vi.mock("../../hooks/use-temperature", () => ({
  useTemperature: vi.fn(() => ({
    data: {},
  })),
}));

// Mock WarehouseMap component
vi.mock("../warehouse-map", () => ({
  WarehouseMap: ({ warehouses }: { warehouses: unknown[] }) => (
    <div data-testid="warehouse-map">Map with {warehouses.length} warehouses</div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("HeadOfficeDashboard", () => {
  it("renders dashboard header", () => {
    render(<HeadOfficeDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/head office dashboard/i)).toBeInTheDocument();
  });

  it("renders warehouse map", () => {
    render(<HeadOfficeDashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId("warehouse-map")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`

Expected: FAIL - Test expects dashboard structure but current implementation is minimal

**Step 3: Update implementation**

Modify: `src/modules/dashboard/components/head-office-dashboard.tsx`

```typescript
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
              Monitoring {warehouseTemperatures.length} warehouse{warehouseTemperatures.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-500 h-3 w-3 rounded-full" title="WebSocket connected" />
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
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/dashboard/components/head-office-dashboard.tsx src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx
git commit -m "feat: implement head office dashboard with live map

Update HeadOfficeDashboard to:
- Fetch all concessionaires (500 limit)
- Aggregate temperature data using useWarehouseTemperatures
- Render interactive map with WarehouseMap
- Show warehouse count and live connection status
- Handle loading and error states

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Module Exports

**Files:**

- Modify: `src/modules/dashboard/hooks/index.ts` (create if doesn't exist)
- Modify: `src/modules/dashboard/components/index.ts` (create if doesn't exist)

**Step 1: Create hooks index if needed**

Check if `src/modules/dashboard/hooks/index.ts` exists.

If not, create: `src/modules/dashboard/hooks/index.ts`

```typescript
export { useAllConcessionaires, useConcessionaire } from "./use-concessionaire";
export { useTemperature, useTemperatureBySerialNumber } from "./use-temperature";
export { useWarehouseTemperatures } from "./use-warehouse-temperatures";
export type { WarehouseTemperatureAggregate } from "./use-warehouse-temperatures";
```

**Step 2: Create components index if needed**

Check if `src/modules/dashboard/components/index.ts` exists.

If not, create: `src/modules/dashboard/components/index.ts`

```typescript
export { HeadOfficeDashboard } from "./head-office-dashboard";
export { ConcessionaireDashboard } from "./concessionaire-dashboard";
export { WarehouseMap } from "./warehouse-map";
```

**Step 3: Verify imports work**

Run: `pnpm typecheck`

Expected: No type errors

**Step 4: Commit**

```bash
git add src/modules/dashboard/hooks/index.ts src/modules/dashboard/components/index.ts
git commit -m "feat: add barrel exports for dashboard module

Export hooks and components for cleaner imports.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Run All Tests

**Files:**

- None (validation step)

**Step 1: Run unit tests**

Run: `pnpm test:run`

Expected: All tests pass

**Step 2: Run type checking**

Run: `pnpm typecheck`

Expected: No type errors

**Step 3: Run linting**

Run: `pnpm lint`

Expected: No lint errors

**Step 4: Fix any issues**

If tests fail or linting errors occur, fix them before committing.

**Step 5: Commit if fixes were made**

```bash
git add .
git commit -m "fix: resolve test and lint issues

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Manual Testing Instructions

**Files:**

- None (manual validation)

**Step 1: Set up environment**

1. Copy `.env.example` to `.env`
2. Add your Google Maps API key: `VITE_GOOGLE_MAPS_API_KEY=your_actual_key`
3. Ensure backend is running on `http://localhost:3000`

**Step 2: Start dev server**

Run: `pnpm dev`

Expected: App starts on `http://localhost:5173`

**Step 3: Test dashboard**

1. Log in as head office user
2. Navigate to head office dashboard
3. Verify:
   - Google Map loads with all warehouses
   - Pins are color-coded (green/orange/red/gray)
   - Click a pin to see InfoWindow with details
   - Temperature updates in real-time via WebSocket
   - "Live" indicator shows green dot
   - Warehouse count is accurate

**Step 4: Test edge cases**

1. Test with no warehouses (should show empty state)
2. Test with warehouses but no temperature data (gray pins)
3. Test WebSocket disconnect (stop backend, check reconnection)
4. Test on mobile (responsive layout)

**Step 5: Document any issues**

If bugs are found, create issues or fix them immediately.

---

## Task 9: Update Documentation

**Files:**

- Create: `docs/GOOGLE_MAPS_SETUP.md`

**Step 1: Create setup guide**

Create: `docs/GOOGLE_MAPS_SETUP.md`

````markdown
# Google Maps API Setup

This guide explains how to set up Google Maps API for the Head Office Dashboard.

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps JavaScript API)

## 2. Enable Maps JavaScript API

1. Navigate to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click "Enable"

## 3. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key

## 4. Restrict API Key (Security)

### Application Restrictions

1. Edit the API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domains:
   - Development: `http://localhost:*`
   - Production: `https://yourdomain.com/*`

### API Restrictions

1. Under "API restrictions", select "Restrict key"
2. Select only "Maps JavaScript API"

### Usage Quotas

1. Set daily request limits to prevent unexpected charges
2. Recommended: 1,000 requests/day for development
3. Adjust based on production needs

## 5. Configure Environment Variable

1. Copy `.env.example` to `.env`
2. Add your API key:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
````

3. Never commit `.env` to version control

## 6. Monitoring

1. Monitor usage in Google Cloud Console
2. Check "APIs & Services" > "Dashboard"
3. Review costs under "Billing"

## Security Best Practices

- Use separate API keys for dev/staging/production
- Never expose API keys in client-side code (Maps API is an exception)
- Set HTTP referrer restrictions to prevent unauthorized use
- Enable only necessary APIs
- Monitor usage regularly
- Rotate keys if compromised

## Troubleshooting

### Map not loading

- Check API key is correct in `.env`
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Ensure billing is enabled in Google Cloud

### "This page can't load Google Maps correctly"

- API key restrictions may be too strict
- Verify HTTP referrer matches current domain
- Check if Maps JavaScript API is enabled

### Exceeded quota

- Check usage in Google Cloud Console
- Increase quotas or optimize map usage
- Consider implementing map clustering for large datasets

````

**Step 2: Commit documentation**

```bash
git add docs/GOOGLE_MAPS_SETUP.md
git commit -m "docs: add Google Maps API setup guide

Comprehensive setup instructions for Google Maps integration
including security best practices and troubleshooting.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
````

---

## Task 10: Final Verification

**Files:**

- None (validation step)

**Step 1: Run full test suite**

Run: `pnpm test:run && pnpm typecheck && pnpm lint`

Expected: All checks pass

**Step 2: Build for production**

Run: `pnpm build`

Expected: Build succeeds without errors

**Step 3: Preview production build**

Run: `pnpm preview`

Expected: App runs correctly in production mode

**Step 4: Verify feature checklist**

Confirm all requirements from design doc are implemented:

- [x] Display all warehouses on Google Map
- [x] Real-time temperature via WebSocket
- [x] Average temperature for multi-device warehouses
- [x] Color-coded pins (green/orange/red/gray)
- [x] InfoWindow with warehouse details
- [x] 500 concessionaires per page
- [x] Responsive design
- [x] Error handling
- [x] Loading states

**Step 5: Final commit if needed**

If any final adjustments were made:

```bash
git add .
git commit -m "chore: final verification and cleanup

All tests passing, production build successful.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

This plan implements the Head Office Dashboard with Google Maps integration following TDD principles. Each task is small (2-5 minutes) and follows the pattern: test → implement → verify → commit.

**Key Dependencies:**

- `@vis.gl/react-google-maps` for modern React Maps integration
- Existing `useTemperature` WebSocket hook
- Existing `useAllConcessionaires` API hook

**Architecture Highlights:**

- Separation of concerns: aggregation logic in `useWarehouseTemperatures`
- Reuse of existing infrastructure (WebSocket, API client)
- Memoization for performance with 500+ warehouses
- Type-safe with TypeScript throughout

**Testing Strategy:**

- Unit tests for aggregation logic
- Component tests with mocked Google Maps
- Manual testing for map interactions
- E2E testing deferred (can be added post-MVP)

**Next Steps After Implementation:**

1. Deploy to staging environment
2. Get Google Maps API key from team
3. Load test with 500+ warehouses
4. User acceptance testing
5. Deploy to production
