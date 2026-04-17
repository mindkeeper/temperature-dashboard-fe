# Concessionaire Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich the concessionaire dashboard with KPI cards, enhanced live temperature cards, a time-series chart, and a breach log table (mock data).

**Architecture:** Reuse existing hooks (`useKpiMetrics`, `useWarehouseTemperatures`, `useTemperature`, `useConcessionaire`) and components (`KpiCard`, `TemperatureTimeseriesCard`) scoped to the concessionaire's own data. Add one new enhanced temperature card component and a breach log table with mock data.

**Tech Stack:** React, TypeScript, TanStack Query, shadcn/ui (Card, Table), lucide-react, Tailwind CSS

---

### Task 1: Create enhanced concessionaire temperature card component

**Files:**

- Create: `src/modules/dashboard/components/concessionaire-temperature-card.tsx`

**Step 1: Create the component**

```tsx
import { formatDistanceToNowStrict } from "date-fns";

import { cn } from "@/lib/utils";

interface ConcessionaireTemperatureCardProps {
  warehouseName: string;
  deviceSerialNumber: string;
  temperature: number;
  unit: string;
  lastUpdate: number; // unix ms timestamp
}

const getTemperatureStatus = (temp: number): "green" | "orange" | "red" => {
  if (temp <= -20) return "green";
  if (temp <= -11) return "orange";
  return "red";
};

const statusDotClass = {
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

const statusTempClass = {
  green: "text-green-600 dark:text-green-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
};

export function ConcessionaireTemperatureCard({
  warehouseName,
  deviceSerialNumber,
  temperature,
  unit,
  lastUpdate,
}: ConcessionaireTemperatureCardProps) {
  const status = getTemperatureStatus(temperature);
  const updatedAgo = formatDistanceToNowStrict(new Date(lastUpdate), { addSuffix: true });

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", statusDotClass[status])} />
            <h3 className="font-semibold">{warehouseName}</h3>
          </div>
          <p className="text-muted-foreground text-xs">{deviceSerialNumber}</p>
        </div>
        <div className="text-right">
          <div className={cn("text-3xl font-bold", statusTempClass[status])}>
            {temperature}°{unit}
          </div>
          <p className="text-muted-foreground text-xs">Updated {updatedAgo}</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors for this file.

**Step 3: Commit**

```bash
git add src/modules/dashboard/components/concessionaire-temperature-card.tsx
git commit -m "feat: add enhanced concessionaire temperature card with status dot and last update"
```

---

### Task 2: Create breach log table component with mock data

**Files:**

- Create: `src/modules/dashboard/components/breach-log-table.tsx`

**Step 1: Create the component**

```tsx
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BreachEvent {
  id: string;
  warehouseName: string;
  startedAt: Date;
  durationMinutes: number;
  maxTemperature: number;
  unit: string;
  status: "Resolved" | "Active";
}

// TODO: replace with real API when breach history endpoint is available
const MOCK_BREACH_EVENTS: BreachEvent[] = [
  {
    id: "1",
    warehouseName: "Warehouse A",
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 12 * 60 * 1000),
    durationMinutes: 14,
    maxTemperature: -8.3,
    unit: "C",
    status: "Resolved",
  },
  {
    id: "2",
    warehouseName: "Warehouse B",
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    durationMinutes: 32,
    maxTemperature: -5.1,
    unit: "C",
    status: "Resolved",
  },
  {
    id: "3",
    warehouseName: "Warehouse A",
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
    durationMinutes: 5,
    maxTemperature: -9.2,
    unit: "C",
    status: "Resolved",
  },
];

export function BreachLogTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Breach Log</CardTitle>
        <p className="text-muted-foreground text-sm">Recent temperature breach events</p>
      </CardHeader>
      <CardContent>
        {MOCK_BREACH_EVENTS.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">No breach events found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Max Temp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BREACH_EVENTS.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.warehouseName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(event.startedAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell>{event.durationMinutes} min</TableCell>
                  <TableCell className="text-red-600 dark:text-red-400">
                    {event.maxTemperature}°{event.unit}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        event.status === "Active"
                          ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300"
                      }
                    >
                      {event.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/modules/dashboard/components/breach-log-table.tsx
git commit -m "feat: add breach log table with mock data"
```

---

### Task 3: Rewrite ConcessionaireDashboard to full layout

**Files:**

- Modify: `src/modules/dashboard/components/concessionaire-dashboard.tsx`

**Step 1: Replace the component**

```tsx
import { AlertTriangle, Clock, Radio, Thermometer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/modules/auth";

import { useConcessionaire } from "../hooks/use-concessionaire";
import { useKpiMetrics } from "../hooks/use-kpi-metrics";
import { useTemperature } from "../hooks/use-temperature";
import { useWarehouseTemperatures } from "../hooks/use-warehouse-temperatures";

import { BreachLogTable } from "./breach-log-table";
import { ConcessionaireTemperatureCard } from "./concessionaire-temperature-card";
import { KpiCard } from "./kpi-card";
import { TemperatureTimeseriesCard } from "./temperature-timeseries-card";

export function ConcessionaireDashboard() {
  const { user } = useAuth();
  const concessId = user?.concessionaries[0]?.concessionaireId;
  const { data, isLoading } = useConcessionaire(concessId ?? "");

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const { data: temperatureMap = {} } = useTemperature();

  // Wrap single concessionaire into the shape useWarehouseTemperatures expects
  const concessionaireList = useMemo(() => (data ? [data] : []), [data]);

  const warehouseTemperatures = useWarehouseTemperatures(
    concessionaireList,
    temperatureMap,
    currentTime
  );

  const metrics = useKpiMetrics(warehouseTemperatures, currentTime);

  // Build live temperature cards from temperatureMap keyed by device serial
  const liveCards = useMemo(() => {
    if (!data) return [];
    return data.warehouses
      .map((warehouse) => {
        const device = warehouse.devices.find((d) => d.isActive);
        if (!device) return null;
        const tempData = temperatureMap[device.serialNumber];
        if (!tempData) return null;
        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          temperature: tempData.temp,
          unit: tempData.unit,
          deviceSerialNumber: tempData.sn,
          lastUpdate: tempData.ts,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [data, temperatureMap]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const atRiskVariant = metrics.atRisk.total === 0 ? "success" : "danger";
  const freshnessVariant =
    metrics.dataFreshness.staleCount === 0
      ? "success"
      : metrics.dataFreshness.staleCount <= 2
        ? "warning"
        : "danger";

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Temperature Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring for your warehouses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Devices"
          icon={Radio}
          primaryMetric={`${String(metrics.activeDevices.total)} devices`}
          secondaryDetail={`${String(metrics.activeDevices.online)} online • ${String(metrics.activeDevices.offline)} offline`}
          variant={metrics.activeDevices.offline > 0 ? "danger" : "success"}
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
              : `${String(metrics.atRisk.critical)} critical • ${String(metrics.atRisk.warning)} warning`
          }
          variant={atRiskVariant}
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
        />
        <KpiCard
          title="Average System Temp"
          icon={Thermometer}
          primaryMetric={
            metrics.averageTemp.value === null ? "—" : `${metrics.averageTemp.value.toFixed(1)}°C`
          }
          secondaryDetail={`Across ${String(metrics.averageTemp.sensorCount)} sensor${metrics.averageTemp.sensorCount !== 1 ? "s" : ""}`}
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

      {/* Live Temperature Grid */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Live Temperature</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {liveCards.length === 0 ? (
            <div className="text-muted-foreground col-span-full text-center">
              Waiting for temperature data...
            </div>
          ) : (
            liveCards.map((card) => (
              <ConcessionaireTemperatureCard
                key={card.warehouseId}
                warehouseName={card.warehouseName}
                deviceSerialNumber={card.deviceSerialNumber}
                temperature={card.temperature}
                unit={card.unit}
                lastUpdate={card.lastUpdate}
              />
            ))
          )}
        </div>
      </div>

      {/* Time-series Chart */}
      <TemperatureTimeseriesCard />

      {/* Breach Log */}
      <BreachLogTable />
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Update the barrel export if needed**

Check `src/modules/dashboard/components/index.ts` — add exports for new components if they are exported there.

```bash
cat src/modules/dashboard/components/index.ts
```

Add any missing exports:

```ts
export { ConcessionaireTemperatureCard } from "./concessionaire-temperature-card";
export { BreachLogTable } from "./breach-log-table";
```

**Step 4: Commit**

```bash
git add src/modules/dashboard/components/concessionaire-dashboard.tsx src/modules/dashboard/components/index.ts
git commit -m "feat: redesign concessionaire dashboard with KPI cards, enhanced live temp, timeseries, and breach log"
```

---

### Task 4: Verify in browser

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Manual checks**

- Log in as a concessionaire user
- Verify 4 KPI cards appear at top with correct colors
- Verify live temperature grid shows status dots and "Updated X ago"
- Verify time-series chart renders (select concessionaire + date range)
- Verify breach log table shows mock rows
- Log in as head office — confirm head office dashboard is unchanged
