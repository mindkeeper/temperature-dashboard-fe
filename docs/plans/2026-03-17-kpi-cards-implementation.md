# KPI Cards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4 interactive KPI cards to the Head Office Dashboard that display system health metrics and enable filtering of the warehouse map

**Architecture:** Create reusable KPI card component, add KPI metrics calculation hook, implement filter state management in dashboard, pass filters to WarehouseMap component

**Tech Stack:** React 19, TypeScript, Tailwind CSS, lucide-react icons, Vitest + Testing Library

---

## Task 1: Create KPI Card Component

**Files:**

- Create: `src/modules/dashboard/components/kpi-card.tsx`
- Create: `src/modules/dashboard/components/__tests__/kpi-card.test.tsx`

**Step 1: Write the failing test for non-interactive KPI card**

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Thermometer } from "lucide-react";

import { KpiCard } from "../kpi-card";

describe("KpiCard", () => {
  it("renders title, primary metric, and secondary detail", () => {
    render(
      <KpiCard
        title="Test Metric"
        icon={Thermometer}
        primaryMetric="123"
        secondaryDetail="Test detail"
      />
    );

    expect(screen.getByText("Test Metric")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Test detail")).toBeInTheDocument();
  });

  it("renders with status color variants", () => {
    const { container } = render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        variant="success"
      />
    );

    expect(container.querySelector('[data-variant="success"]')).toBeInTheDocument();
  });

  it("renders as non-interactive by default", () => {
    const { container } = render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
      />
    );

    expect(container.querySelector("button")).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/dashboard/components/__tests__/kpi-card.test.tsx`
Expected: FAIL with "Cannot find module '../kpi-card'"

**Step 3: Write minimal KPI card component**

```typescript
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  primaryMetric: string;
  secondaryDetail: string;
  variant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
  isActive?: boolean;
  activeLabel?: string;
}

export function KpiCard({
  title,
  icon: Icon,
  primaryMetric,
  secondaryDetail,
  variant = "default",
  onClick,
  isActive = false,
  activeLabel,
}: KpiCardProps) {
  const variantStyles = {
    default: "text-blue-500",
    success: "text-green-500",
    warning: "text-orange-500",
    danger: "text-red-500",
  };

  const content = (
    <div className="flex flex-col gap-4" data-variant={variant}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", variantStyles[variant])} />
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-bold">{primaryMetric}</p>
        <p className="text-sm text-muted-foreground">{secondaryDetail}</p>
      </div>
      {isActive && activeLabel && (
        <p className="text-xs text-blue-600 font-medium">{activeLabel}</p>
      )}
    </div>
  );

  if (onClick) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isActive && "ring-2 ring-blue-500"
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <CardContent className="p-6">{content}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/components/__tests__/kpi-card.test.tsx`
Expected: PASS (3 tests)

**Step 5: Write test for interactive KPI card**

Add to `src/modules/dashboard/components/__tests__/kpi-card.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Thermometer } from "lucide-react";

import { KpiCard } from "../kpi-card";

describe("KpiCard", () => {
  // ... previous tests ...

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        onClick={onClick}
      />
    );

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows active state when isActive is true", () => {
    const { container } = render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        onClick={() => {}}
        isActive={true}
        activeLabel="Viewing filtered"
      />
    );

    expect(screen.getByText("Viewing filtered")).toBeInTheDocument();
    expect(container.querySelector(".ring-2")).toBeInTheDocument();
  });

  it("supports keyboard interaction with Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        onClick={onClick}
      />
    );

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

**Step 6: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/components/__tests__/kpi-card.test.tsx`
Expected: PASS (6 tests)

**Step 7: Commit**

```bash
git add src/modules/dashboard/components/kpi-card.tsx src/modules/dashboard/components/__tests__/kpi-card.test.tsx
git commit -m "feat: add KPI card component with interactive support

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create KPI Metrics Hook

**Files:**

- Create: `src/modules/dashboard/hooks/use-kpi-metrics.ts`
- Create: `src/modules/dashboard/hooks/__tests__/use-kpi-metrics.test.tsx`

**Step 1: Write the failing test for KPI metrics calculation**

```typescript
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { WarehouseTemperatureAggregate } from "../use-warehouse-temperatures";
import { useKpiMetrics } from "../use-kpi-metrics";

describe("useKpiMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates active devices metrics", () => {
    const warehouses: WarehouseTemperatureAggregate[] = [
      {
        warehouseId: "w1",
        warehouseName: "Warehouse 1",
        address: "Address 1",
        latitude: -6.2,
        longitude: 106.8,
        concessionaireName: "Concessionaire A",
        averageTemperature: -20,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 8,
        lastUpdate: Date.now(),
        status: "green",
      },
      {
        warehouseId: "w2",
        warehouseName: "Warehouse 2",
        address: "Address 2",
        latitude: -6.3,
        longitude: 106.9,
        concessionaireName: "Concessionaire B",
        averageTemperature: -15,
        unit: "C",
        deviceCount: 20,
        reportingDeviceCount: 15,
        lastUpdate: Date.now(),
        status: "orange",
      },
    ];

    const { result } = renderHook(() => useKpiMetrics(warehouses));

    expect(result.current.activeDevices.total).toBe(30);
    expect(result.current.activeDevices.online).toBe(23);
    expect(result.current.activeDevices.offline).toBe(7);
  });

  it("calculates warehouses at risk", () => {
    const warehouses: WarehouseTemperatureAggregate[] = [
      {
        warehouseId: "w1",
        warehouseName: "Warehouse 1",
        address: "Address 1",
        latitude: -6.2,
        longitude: 106.8,
        concessionaireName: "Concessionaire A",
        averageTemperature: -20,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 10,
        lastUpdate: Date.now(),
        status: "green",
      },
      {
        warehouseId: "w2",
        warehouseName: "Warehouse 2",
        address: "Address 2",
        latitude: -6.3,
        longitude: 106.9,
        concessionaireName: "Concessionaire B",
        averageTemperature: -15,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 10,
        lastUpdate: Date.now(),
        status: "orange",
      },
      {
        warehouseId: "w3",
        warehouseName: "Warehouse 3",
        address: "Address 3",
        latitude: -6.4,
        longitude: 107.0,
        concessionaireName: "Concessionaire C",
        averageTemperature: -5,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 10,
        lastUpdate: Date.now(),
        status: "red",
      },
    ];

    const { result } = renderHook(() => useKpiMetrics(warehouses));

    expect(result.current.atRisk.total).toBe(2);
    expect(result.current.atRisk.critical).toBe(1);
    expect(result.current.atRisk.warning).toBe(1);
  });

  it("calculates stale warehouses (>15 min)", () => {
    const now = Date.now();
    const warehouses: WarehouseTemperatureAggregate[] = [
      {
        warehouseId: "w1",
        warehouseName: "Warehouse 1",
        address: "Address 1",
        latitude: -6.2,
        longitude: 106.8,
        concessionaireName: "Concessionaire A",
        averageTemperature: -20,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 10,
        lastUpdate: now - 10 * 60 * 1000, // 10 min ago - fresh
        status: "green",
      },
      {
        warehouseId: "w2",
        warehouseName: "Warehouse 2",
        address: "Address 2",
        latitude: -6.3,
        longitude: 106.9,
        concessionaireName: "Concessionaire B",
        averageTemperature: -15,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 10,
        lastUpdate: now - 20 * 60 * 1000, // 20 min ago - stale
        status: "orange",
      },
      {
        warehouseId: "w3",
        warehouseName: "Warehouse 3",
        address: "Address 3",
        latitude: -6.4,
        longitude: 107.0,
        concessionaireName: "Concessionaire C",
        averageTemperature: null,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 0,
        lastUpdate: null, // No data - stale
        status: "gray",
      },
    ];

    const { result } = renderHook(() => useKpiMetrics(warehouses));

    expect(result.current.dataFreshness.staleCount).toBe(2);
  });

  it("calculates average system temperature", () => {
    const warehouses: WarehouseTemperatureAggregate[] = [
      {
        warehouseId: "w1",
        warehouseName: "Warehouse 1",
        address: "Address 1",
        latitude: -6.2,
        longitude: 106.8,
        concessionaireName: "Concessionaire A",
        averageTemperature: -20,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 10,
        lastUpdate: Date.now(),
        status: "green",
      },
      {
        warehouseId: "w2",
        warehouseName: "Warehouse 2",
        address: "Address 2",
        latitude: -6.3,
        longitude: 106.9,
        concessionaireName: "Concessionaire B",
        averageTemperature: -18,
        unit: "C",
        deviceCount: 15,
        reportingDeviceCount: 15,
        lastUpdate: Date.now(),
        status: "orange",
      },
    ];

    const { result } = renderHook(() => useKpiMetrics(warehouses));

    expect(result.current.averageTemp.value).toBe(-19);
    expect(result.current.averageTemp.sensorCount).toBe(25);
    expect(result.current.averageTemp.status).toBe("orange");
  });

  it("returns null average temp when no data", () => {
    const warehouses: WarehouseTemperatureAggregate[] = [
      {
        warehouseId: "w1",
        warehouseName: "Warehouse 1",
        address: "Address 1",
        latitude: -6.2,
        longitude: 106.8,
        concessionaireName: "Concessionaire A",
        averageTemperature: null,
        unit: "C",
        deviceCount: 10,
        reportingDeviceCount: 0,
        lastUpdate: null,
        status: "gray",
      },
    ];

    const { result } = renderHook(() => useKpiMetrics(warehouses));

    expect(result.current.averageTemp.value).toBeNull();
    expect(result.current.averageTemp.sensorCount).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/dashboard/hooks/__tests__/use-kpi-metrics.test.tsx`
Expected: FAIL with "Cannot find module '../use-kpi-metrics'"

**Step 3: Write minimal KPI metrics hook implementation**

```typescript
import { useMemo } from "react";

import type { WarehouseTemperatureAggregate } from "./use-warehouse-temperatures";

const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

interface KpiMetrics {
  activeDevices: {
    total: number;
    online: number;
    offline: number;
  };
  atRisk: {
    total: number;
    critical: number;
    warning: number;
  };
  dataFreshness: {
    staleCount: number;
  };
  averageTemp: {
    value: number | null;
    sensorCount: number;
    status: "green" | "orange" | "red" | "gray";
  };
}

const getTemperatureStatus = (temp: number): "green" | "orange" | "red" => {
  if (temp <= -20) return "green";
  if (temp <= -11) return "orange";
  return "red";
};

export const useKpiMetrics = (warehouses: WarehouseTemperatureAggregate[]): KpiMetrics => {
  return useMemo(() => {
    // Active devices
    const totalDevices = warehouses.reduce((sum, w) => sum + w.deviceCount, 0);
    const onlineDevices = warehouses.reduce((sum, w) => sum + w.reportingDeviceCount, 0);
    const offlineDevices = totalDevices - onlineDevices;

    // Warehouses at risk
    const atRiskWarehouses = warehouses.filter((w) => w.status === "orange" || w.status === "red");
    const criticalCount = warehouses.filter((w) => w.status === "red").length;
    const warningCount = warehouses.filter((w) => w.status === "orange").length;

    // Data freshness
    const currentTime = Date.now();
    const staleWarehouses = warehouses.filter(
      (w) => w.lastUpdate === null || currentTime - w.lastUpdate > STALE_THRESHOLD_MS
    );

    // Average system temperature
    const temperaturesWithData = warehouses.filter((w) => w.averageTemperature !== null);
    const avgTemp =
      temperaturesWithData.length > 0
        ? temperaturesWithData.reduce((sum, w) => sum + (w.averageTemperature ?? 0), 0) /
          temperaturesWithData.length
        : null;
    const sensorCount = warehouses.reduce((sum, w) => sum + w.reportingDeviceCount, 0);
    const tempStatus = avgTemp === null ? "gray" : getTemperatureStatus(avgTemp);

    return {
      activeDevices: {
        total: totalDevices,
        online: onlineDevices,
        offline: offlineDevices,
      },
      atRisk: {
        total: atRiskWarehouses.length,
        critical: criticalCount,
        warning: warningCount,
      },
      dataFreshness: {
        staleCount: staleWarehouses.length,
      },
      averageTemp: {
        value: avgTemp,
        sensorCount,
        status: tempStatus,
      },
    };
  }, [warehouses]);
};
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/hooks/__tests__/use-kpi-metrics.test.tsx`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add src/modules/dashboard/hooks/use-kpi-metrics.ts src/modules/dashboard/hooks/__tests__/use-kpi-metrics.test.tsx
git commit -m "feat: add KPI metrics calculation hook

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add Filter State Management to Dashboard

**Files:**

- Modify: `src/modules/dashboard/components/head-office-dashboard.tsx`
- Modify: `src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`

**Step 1: Write test for filter state management**

Add to `src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";

import { HeadOfficeDashboard } from "../head-office-dashboard";
import * as useConcessionaireModule from "../../hooks/use-concessionaire";
import * as useTemperatureModule from "../../hooks/use-temperature";

vi.mock("../../hooks/use-concessionaire");
vi.mock("../../hooks/use-temperature");

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe("HeadOfficeDashboard - Filter State", () => {
  it("toggles offline devices filter when clicking Active Devices card", async () => {
    const user = userEvent.setup();

    vi.mocked(useConcessionaireModule.useAllConcessionaires).mockReturnValue({
      data: {
        data: [
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
                    specifications: { type: "Temperature" },
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
        ],
      },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useTemperatureModule.useTemperature).mockReturnValue({
      data: {
        SN001: { sn: "SN001", temp: -20, unit: "C", ts: Date.now() },
      },
    } as any);

    render(<HeadOfficeDashboard />, { wrapper: createWrapper() });

    const activeDevicesCard = screen.getByText("Active Devices").closest("[role='button']");
    expect(activeDevicesCard).toBeInTheDocument();

    // Click to activate filter
    await user.click(activeDevicesCard!);
    expect(screen.getByText(/Viewing offline devices/i)).toBeInTheDocument();

    // Click again to deactivate
    await user.click(activeDevicesCard!);
    expect(screen.queryByText(/Viewing offline devices/i)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`
Expected: FAIL - KPI cards not yet added to dashboard

**Step 3: Add filter state and KPI cards to dashboard**

Update `src/modules/dashboard/components/head-office-dashboard.tsx`:

```typescript
import { useMemo, useState } from "react";
import { Radio, AlertTriangle, Clock, Thermometer } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAllConcessionaires } from "../hooks/use-concessionaire";
import { useTemperature } from "../hooks/use-temperature";
import { useWarehouseTemperatures } from "../hooks/use-warehouse-temperatures";
import { useKpiMetrics } from "../hooks/use-kpi-metrics";

import { WarehouseMap } from "./warehouse-map";
import { KpiCard } from "./kpi-card";

type FilterType = "offlineDevices" | "atRisk" | "staleData" | null;

export function HeadOfficeDashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  // Fetch all concessionaires with warehouses
  const { data: concessionairesData, isLoading, error } = useAllConcessionaires({ limit: 100 });
  const concessionaires = useMemo(() => concessionairesData?.data ?? [], [concessionairesData]);

  // Get real-time temperature data from WebSocket
  const { data: temperatureMap = {} } = useTemperature();

  // Aggregate warehouse-level temperatures
  const warehouseTemperatures = useWarehouseTemperatures(concessionaires, temperatureMap);

  // Calculate KPI metrics
  const metrics = useKpiMetrics(warehouseTemperatures);

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

  const offlinePercentage = metrics.activeDevices.total > 0
    ? Math.round((metrics.activeDevices.online / metrics.activeDevices.total) * 100)
    : 0;

  const atRiskVariant = metrics.atRisk.total === 0 ? "success" : "danger";
  const freshnessVariant =
    metrics.dataFreshness.staleCount === 0
      ? "success"
      : metrics.dataFreshness.staleCount <= 3
        ? "warning"
        : "danger";

  return (
    <div className="h-[calc(100vh-57px)] p-4">
      {/* 2x2 Grid Layout */}
      <div className="grid h-full grid-cols-1 grid-rows-2 gap-4 md:grid-cols-2">
        {/* Row 1, Col 1 - KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            title="Active Devices"
            icon={Radio}
            primaryMetric={`${metrics.activeDevices.total} devices`}
            secondaryDetail={`${metrics.activeDevices.online} online • ${metrics.activeDevices.offline} offline`}
            variant="default"
            onClick={() => toggleFilter("offlineDevices")}
            isActive={activeFilter === "offlineDevices"}
            activeLabel="Viewing offline devices"
          />

          <KpiCard
            title="Warehouses at Risk"
            icon={AlertTriangle}
            primaryMetric={
              metrics.atRisk.total === 0
                ? "All clear"
                : `${metrics.atRisk.total} warehouse${metrics.atRisk.total !== 1 ? "s" : ""}`
            }
            secondaryDetail={
              metrics.atRisk.total === 0
                ? "No temperature issues"
                : `${metrics.atRisk.critical} critical • ${metrics.atRisk.warning} warning`
            }
            variant={atRiskVariant}
            onClick={() => toggleFilter("atRisk")}
            isActive={activeFilter === "atRisk"}
            activeLabel="Viewing at-risk warehouses"
          />

          <KpiCard
            title="Data Freshness"
            icon={Clock}
            primaryMetric={
              metrics.dataFreshness.staleCount === 0
                ? "All fresh"
                : `${metrics.dataFreshness.staleCount} warehouse${metrics.dataFreshness.staleCount !== 1 ? "s" : ""}`
            }
            secondaryDetail={
              metrics.dataFreshness.staleCount === 0
                ? "All data current"
                : "No updates for 15+ min"
            }
            variant={freshnessVariant}
            onClick={() => toggleFilter("staleData")}
            isActive={activeFilter === "staleData"}
            activeLabel="Viewing stale warehouses"
          />

          <KpiCard
            title="Average System Temp"
            icon={Thermometer}
            primaryMetric={
              metrics.averageTemp.value === null
                ? "—"
                : `${metrics.averageTemp.value.toFixed(1)}°C`
            }
            secondaryDetail={`Across ${metrics.averageTemp.sensorCount} sensor${metrics.averageTemp.sensorCount !== 1 ? "s" : ""}`}
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

        {/* Row 1, Col 2 - Warehouse Map */}
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

        {/* Row 2 - Empty for now */}
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
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/dashboard/components/head-office-dashboard.tsx src/modules/dashboard/components/__tests__/head-office-dashboard.test.tsx
git commit -m "feat: add KPI cards and filter state to dashboard

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Add Filter Support to WarehouseMap Component

**Files:**

- Modify: `src/modules/dashboard/components/warehouse-map.tsx`
- Modify: `src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`

**Step 1: Write test for warehouse map filtering**

Add to `src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`:

```typescript
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { WarehouseMap } from "../warehouse-map";
import type { WarehouseTemperatureAggregate } from "../../hooks/use-warehouse-temperatures";

// Mock Google Maps
vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Map: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  AdvancedMarker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pin: () => <div data-testid="pin" />,
}));

const mockWarehouses: WarehouseTemperatureAggregate[] = [
  {
    warehouseId: "w1",
    warehouseName: "Warehouse 1",
    address: "Address 1",
    latitude: -6.2,
    longitude: 106.8,
    concessionaireName: "Concessionaire A",
    averageTemperature: -20,
    unit: "C",
    deviceCount: 10,
    reportingDeviceCount: 8,
    lastUpdate: Date.now(),
    status: "green",
  },
  {
    warehouseId: "w2",
    warehouseName: "Warehouse 2",
    address: "Address 2",
    latitude: -6.3,
    longitude: 106.9,
    concessionaireName: "Concessionaire B",
    averageTemperature: -15,
    unit: "C",
    deviceCount: 20,
    reportingDeviceCount: 20,
    lastUpdate: Date.now(),
    status: "orange",
  },
  {
    warehouseId: "w3",
    warehouseName: "Warehouse 3",
    address: "Address 3",
    latitude: -6.4,
    longitude: 107.0,
    concessionaireName: "Concessionaire C",
    averageTemperature: -5,
    unit: "C",
    deviceCount: 15,
    reportingDeviceCount: 15,
    lastUpdate: Date.now(),
    status: "red",
  },
];

describe("WarehouseMap - Filtering", () => {
  it("shows all warehouses when no filter is active", () => {
    const { getAllByTestId } = render(<WarehouseMap warehouses={mockWarehouses} filter={null} />);

    const pins = getAllByTestId("pin");
    expect(pins).toHaveLength(3);
  });

  it("filters to warehouses with offline devices when offlineDevices filter active", () => {
    const warehousesWithOffline: WarehouseTemperatureAggregate[] = [
      { ...mockWarehouses[0], deviceCount: 10, reportingDeviceCount: 8 }, // 2 offline
      { ...mockWarehouses[1], deviceCount: 10, reportingDeviceCount: 10 }, // 0 offline
    ];

    const { getAllByTestId } = render(
      <WarehouseMap warehouses={warehousesWithOffline} filter="offlineDevices" />
    );

    const pins = getAllByTestId("pin");
    expect(pins).toHaveLength(1); // Only w1 has offline devices
  });

  it("filters to warehouses at risk (orange/red) when atRisk filter active", () => {
    const { getAllByTestId } = render(<WarehouseMap warehouses={mockWarehouses} filter="atRisk" />);

    const pins = getAllByTestId("pin");
    expect(pins).toHaveLength(2); // w2 (orange) and w3 (red)
  });

  it("filters to stale warehouses when staleData filter active", () => {
    const now = Date.now();
    const warehousesWithStale: WarehouseTemperatureAggregate[] = [
      { ...mockWarehouses[0], lastUpdate: now - 10 * 60 * 1000 }, // 10 min - fresh
      { ...mockWarehouses[1], lastUpdate: now - 20 * 60 * 1000 }, // 20 min - stale
      { ...mockWarehouses[2], lastUpdate: null }, // No data - stale
    ];

    const { getAllByTestId } = render(
      <WarehouseMap warehouses={warehousesWithStale} filter="staleData" />
    );

    const pins = getAllByTestId("pin");
    expect(pins).toHaveLength(2); // w2 and w3 are stale
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`
Expected: FAIL - filter prop not yet accepted

**Step 3: Add filtering logic to WarehouseMap**

Update `src/modules/dashboard/components/warehouse-map.tsx`:

```typescript
import { useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

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
  const filteredWarehouses = useMemo(() => {
    if (!filter) return warehouses;

    const currentTime = Date.now();

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
  }, [warehouses, filter]);

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
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/dashboard/components/__tests__/warehouse-map.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/dashboard/components/warehouse-map.tsx src/modules/dashboard/components/__tests__/warehouse-map.test.tsx
git commit -m "feat: add filtering support to warehouse map

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Add Barrel Exports for New Components

**Files:**

- Modify: `src/modules/dashboard/index.ts`

**Step 1: Add exports for new components and hooks**

```typescript
export { HeadOfficeDashboard } from "./components/head-office-dashboard";
export { WarehouseMap } from "./components/warehouse-map";
export { KpiCard } from "./components/kpi-card";
export { useWarehouseTemperatures } from "./hooks/use-warehouse-temperatures";
export { useKpiMetrics } from "./hooks/use-kpi-metrics";
export type { WarehouseTemperatureAggregate } from "./hooks/use-warehouse-temperatures";
```

**Step 2: Verify exports work**

Run: `pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/dashboard/index.ts
git commit -m "feat: add barrel exports for KPI components

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Run All Tests and Verify

**Step 1: Run full test suite**

Run: `pnpm test:run`
Expected: All tests pass

**Step 2: Run type check**

Run: `pnpm typecheck`
Expected: No type errors

**Step 3: Run linter**

Run: `pnpm lint`
Expected: No lint errors

**Step 4: Manual verification checklist**

Start dev server and verify:

- [ ] 4 KPI cards display in top-left quadrant
- [ ] Active Devices card shows correct counts
- [ ] Warehouses at Risk card shows correct counts and variant colors
- [ ] Data Freshness card calculates stale warehouses correctly
- [ ] Average System Temp shows calculated average
- [ ] Clicking Active Devices filters map to warehouses with offline devices
- [ ] Clicking Warehouses at Risk filters map to orange/red warehouses
- [ ] Clicking Data Freshness filters map to stale warehouses
- [ ] Active filter shows border highlight
- [ ] Clicking active filter again clears the filter
- [ ] Keyboard navigation works (Tab + Enter)

Run: `pnpm dev`

**Step 5: Final commit if manual fixes needed**

If any manual adjustments were required:

```bash
git add .
git commit -m "chore: manual verification fixes for KPI cards

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Implementation Complete

All KPI cards have been implemented with:

- ✅ Reusable KPI card component with interactive and non-interactive variants
- ✅ KPI metrics calculation hook with proper memoization
- ✅ Filter state management in dashboard
- ✅ Warehouse map filtering by offline devices, at-risk status, and stale data
- ✅ Full test coverage for all new components and hooks
- ✅ Accessibility support (keyboard navigation, ARIA labels)
- ✅ Responsive design with proper status colors

**Related Skills:**

- @superpowers:test-driven-development - Used TDD approach throughout
- @superpowers:verification-before-completion - Final verification step ensures quality
