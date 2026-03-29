# Temperature Timeseries Card — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a temperature timeseries line chart card to the head office dashboard that shows per-warehouse temperature trends for a selected concessionaire, with date range controls, KPI metrics, and click-to-focus interaction.

**Architecture:** Self-contained card component with a combobox (Popover+Command pattern, infinite query + debounced search), date range presets with custom calendar, recharts line chart via shadcn chart wrapper, and a KPI row. All state is local to the card.

**Tech Stack:** React, TanStack Query (useInfiniteQuery), shadcn/ui (popover, command, chart, calendar), recharts, date-fns, usehooks-ts (useDebounceCallback)

---

### Task 1: Install Dependencies and Add shadcn Components

**Files:**

- Modify: `package.json`
- Create: `src/components/ui/chart.tsx` (via shadcn CLI)
- Create: `src/components/ui/popover.tsx` (via shadcn CLI)
- Create: `src/components/ui/command.tsx` (via shadcn CLI)
- Create: `src/components/ui/calendar.tsx` (via shadcn CLI)

**Step 1: Install npm dependencies**

Run:

```bash
cd /Users/nurcholismajid/Documents/Work/unilever/temperature-dashboard-fe
pnpm add recharts date-fns react-day-picker
```

Expected: packages installed successfully.

**Step 2: Add shadcn components**

Run:

```bash
npx shadcn@latest add chart popover command calendar
```

Expected: components created in `src/components/ui/`. Accept all defaults.

**Step 3: Verify installation**

Run:

```bash
pnpm typecheck
```

Expected: No type errors.

---

### Task 2: Create Stats API Service

**Files:**

- Create: `src/services/stats.ts`

**Step 1: Create the stats service**

Create `src/services/stats.ts`:

```typescript
import { apiClient } from "@/lib/axios";

export interface TimeseriesPoint {
  timestamp: string;
  temperature: number;
}

export interface TemperatureKpi {
  breachCount: number;
  totalWindows: number;
  breachPercentage: number;
}

export interface WarehouseTimeseries {
  warehouseId: string;
  warehouseName: string;
  series: TimeseriesPoint[];
  kpi: TemperatureKpi;
}

export interface GetTimeseriesParams {
  concessId: string;
  startDate?: string;
  endDate?: string;
  interval?: string;
}

interface TimeseriesResponse {
  message: string;
  data: WarehouseTimeseries[];
}

export const statsService = {
  async getTimeseries(params: GetTimeseriesParams): Promise<TimeseriesResponse> {
    const response = await apiClient.get<TimeseriesResponse>("/stats/timeseries", {
      params,
    });
    return response.data;
  },
};
```

**Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 3: Create useTimeseries Hook

**Files:**

- Create: `src/modules/dashboard/hooks/use-timeseries.ts`

**Step 1: Create the hook**

Create `src/modules/dashboard/hooks/use-timeseries.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";

import { statsService, type GetTimeseriesParams } from "@/services/stats";

export const timeseriesKeys = {
  all: ["timeseries"] as const,
  list: (params: GetTimeseriesParams) => [...timeseriesKeys.all, params] as const,
};

export const useTimeseries = (params: GetTimeseriesParams | null) => {
  return useQuery({
    queryKey: timeseriesKeys.list(params!),
    queryFn: () => statsService.getTimeseries(params!),
    enabled: !!params?.concessId,
    select: (data) => data.data,
  });
};
```

**Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 4: Add useConcessionaireInfinite Hook

**Files:**

- Modify: `src/modules/dashboard/hooks/use-concessionaire.ts`

**Step 1: Add `useInfiniteQuery` to the existing import from `@tanstack/react-query`**

Change:

```typescript
import { useQuery } from "@tanstack/react-query";
```

To:

```typescript
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
```

**Step 2: Add the infinite query hook at the bottom of the file**

Append after the `useConcessionaire` export:

```typescript
export const useConcessionaireInfinite = (search: string) => {
  return useInfiniteQuery({
    queryKey: [...concessionarieKeys.all, "infinite", search] as const,
    queryFn: ({ pageParam }) =>
      concessionaireService.getAllConcessionaires({
        q: search || undefined,
        page: pageParam,
        limit: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
};
```

**Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 5: Create the ConcessionaireCombobox Component

Uses shadcn Combobox pattern: `Popover` + `Command` components.

**Files:**

- Create: `src/modules/dashboard/components/concessionaire-combobox.tsx`

**Step 1: Create the combobox component**

Create `src/modules/dashboard/components/concessionaire-combobox.tsx`:

```typescript
import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useConcessionaireInfinite } from "../hooks/use-concessionaire";

interface ConcessionaireComboboxProps {
  value: string | null;
  onValueChange: (id: string | null, name: string | null) => void;
}

export function ConcessionaireCombobox({ value, onValueChange }: ConcessionaireComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const debouncedSetSearch = useDebounceCallback((val: string) => {
    setDebouncedSearch(val);
  }, 300);

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearch(val);
      debouncedSetSearch(val);
    },
    [debouncedSetSearch],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConcessionaireInfinite(debouncedSearch);

  const concessionaires = data?.pages.flatMap((page) => page.data) ?? [];
  const selectedName = concessionaires.find((c) => c.id === value)?.name;

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <span className="truncate">
            {value ? (selectedName ?? "Loading...") : "Select concessionaire"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search concessionaire..."
            value={search}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No concessionaire found."}
            </CommandEmpty>
            <CommandGroup>
              {concessionaires.map((concess) => (
                <CommandItem
                  key={concess.id}
                  value={concess.id}
                  onSelect={(currentValue) => {
                    const isDeselect = currentValue === value;
                    onValueChange(
                      isDeselect ? null : concess.id,
                      isDeselect ? null : concess.name,
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === concess.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {concess.name}
                </CommandItem>
              ))}
              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <div className="text-muted-foreground py-2 text-center text-sm">
                  Loading more...
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

**Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 6: Create the DateRangePresets Component

**Files:**

- Create: `src/modules/dashboard/components/date-range-presets.tsx`

**Step 1: Create the date range presets component**

Create `src/modules/dashboard/components/date-range-presets.tsx`:

```typescript
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PresetKey = "24h" | "7d" | "30d" | "custom";

interface DateRangePresetsProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const presets: { key: PresetKey; label: string; getRange: () => { start: Date; end: Date } }[] = [
  {
    key: "24h",
    label: "24h",
    getRange: () => ({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    key: "7d",
    label: "7d",
    getRange: () => ({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    key: "30d",
    label: "30d",
    getRange: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
];

export function DateRangePresets({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangePresetsProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>("30d");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handlePresetClick = (preset: (typeof presets)[number]) => {
    setActivePreset(preset.key);
    const range = preset.getRange();
    onDateRangeChange(range.start, range.end);
  };

  const handleCustomSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setActivePreset("custom");
      onDateRangeChange(range.from, range.to);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {presets.map((preset) => (
        <Button
          key={preset.key}
          variant={activePreset === preset.key ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={activePreset === "custom" ? "default" : "outline"}
            size="sm"
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {activePreset === "custom"
              ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
              : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={handleCustomSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

**Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 7: Create the TemperatureTimeseriesCard Component

**Files:**

- Create: `src/modules/dashboard/components/temperature-timeseries-card.tsx`

**Step 1: Create the main card component**

Create `src/modules/dashboard/components/temperature-timeseries-card.tsx`:

```typescript
import { Thermometer } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

import { useTimeseries } from "../hooks/use-timeseries";
import { ConcessionaireCombobox } from "./concessionaire-combobox";
import { DateRangePresets } from "./date-range-presets";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const BREACH_THRESHOLD = -10;

export function TemperatureTimeseriesCard() {
  const [selectedConcessId, setSelectedConcessId] = useState<string | null>(null);
  const [selectedConcessName, setSelectedConcessName] = useState<string | null>(null);
  const [focusedWarehouseId, setFocusedWarehouseId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(() => ({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  }));

  const handleConcessChange = useCallback(
    (id: string | null, name: string | null) => {
      setSelectedConcessId(id);
      setSelectedConcessName(name);
      setFocusedWarehouseId(null);
    },
    [],
  );

  const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
  }, []);

  const { data: warehouses, isLoading } = useTimeseries(
    selectedConcessId
      ? {
          concessId: selectedConcessId,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        }
      : null,
  );

  // Determine time format based on date range
  const rangeMs = dateRange.endDate.getTime() - dateRange.startDate.getTime();
  const timeFormat = rangeMs <= 24 * 60 * 60 * 1000 ? "HH:mm" : "MMM d HH:mm";

  // Build unified chart data: each row has timestamp + one key per warehouse
  const { chartData, chartConfig } = useMemo(() => {
    if (!warehouses || warehouses.length === 0) {
      return { chartData: [], chartConfig: {} as ChartConfig };
    }

    // Collect all unique timestamps
    const timestampSet = new Set<string>();
    for (const wh of warehouses) {
      for (const point of wh.series) {
        timestampSet.add(point.timestamp);
      }
    }

    const sortedTimestamps = Array.from(timestampSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    // Build lookup: warehouseId -> timestamp -> temperature
    const lookups = new Map<string, Map<string, number>>();
    for (const wh of warehouses) {
      const map = new Map<string, number>();
      for (const point of wh.series) {
        map.set(point.timestamp, point.temperature);
      }
      lookups.set(wh.warehouseId, map);
    }

    const data = sortedTimestamps.map((ts) => {
      const row: Record<string, string | number> = {
        timestamp: ts,
        formattedTime: format(new Date(ts), timeFormat),
      };
      for (const wh of warehouses) {
        const temp = lookups.get(wh.warehouseId)?.get(ts);
        if (temp !== undefined) {
          row[wh.warehouseId] = temp;
        }
      }
      return row;
    });

    const config: ChartConfig = {};
    warehouses.forEach((wh, index) => {
      config[wh.warehouseId] = {
        label: wh.warehouseName,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return { chartData: data, chartConfig: config };
  }, [warehouses, timeFormat]);

  const handleLineClick = useCallback((warehouseId: string) => {
    setFocusedWarehouseId((current) =>
      current === warehouseId ? null : warehouseId,
    );
  }, []);

  const handleChartClick = useCallback((e: React.MouseEvent) => {
    // Only reset if clicking on the chart background (not a line)
    const target = e.target as HTMLElement;
    if (
      target.tagName === "svg" ||
      target.classList.contains("recharts-surface")
    ) {
      setFocusedWarehouseId(null);
    }
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Thermometer className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-base">Temperature Timeseries</CardTitle>
        </div>
      </CardHeader>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2 px-6 pb-2">
        <ConcessionaireCombobox
          value={selectedConcessId}
          onValueChange={handleConcessChange}
        />
        <DateRangePresets
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      <CardContent className="flex flex-1 flex-col p-6 pt-0">
        {!selectedConcessId ? (
          /* No concessionaire selected */
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Select a concessionaire to view temperature trends
            </p>
          </div>
        ) : isLoading ? (
          /* Loading skeleton */
          <div className="flex flex-1 flex-col gap-3">
            <div
              className="bg-muted animate-pulse rounded-md"
              style={{ flex: 1, minHeight: 150 }}
            />
            <div className="flex gap-2">
              <div className="bg-muted h-16 flex-1 animate-pulse rounded-md" />
              <div className="bg-muted h-16 flex-1 animate-pulse rounded-md" />
            </div>
          </div>
        ) : !warehouses || warehouses.length === 0 ? (
          /* No data */
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No timeseries data available
            </p>
          </div>
        ) : (
          /* Chart + KPI */
          <div className="flex flex-1 flex-col gap-3">
            {/* Chart */}
            <div
              className="flex-1"
              style={{ minHeight: 200 }}
              onClick={handleChartClick}
            >
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="formattedTime"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val: number) => `${val.toString()}°C`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend
                    onClick={(e) => {
                      if (e.dataKey) handleLineClick(e.dataKey as string);
                    }}
                    wrapperStyle={{ cursor: "pointer" }}
                  />
                  <ReferenceLine
                    y={BREACH_THRESHOLD}
                    stroke="red"
                    strokeDasharray="5 5"
                    label={{
                      value: "-10°C",
                      position: "right",
                      fill: "red",
                      fontSize: 11,
                    }}
                  />
                  {warehouses.map((wh) => (
                    <Line
                      key={wh.warehouseId}
                      type="monotone"
                      dataKey={wh.warehouseId}
                      name={wh.warehouseName}
                      stroke={chartConfig[wh.warehouseId]?.color}
                      strokeWidth={
                        focusedWarehouseId === wh.warehouseId ? 3 : 2
                      }
                      opacity={
                        focusedWarehouseId === null ||
                        focusedWarehouseId === wh.warehouseId
                          ? 1
                          : 0.15
                      }
                      dot={false}
                      activeDot={{ r: 4 }}
                      onClick={() => handleLineClick(wh.warehouseId)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            </div>

            {/* KPI Row */}
            <div className="flex flex-wrap gap-2">
              {warehouses.map((wh) => {
                const isFocused = focusedWarehouseId === wh.warehouseId;
                const isFaded = focusedWarehouseId !== null && !isFocused;
                const hasBreach = wh.kpi.breachPercentage > 0;

                return (
                  <div
                    key={wh.warehouseId}
                    className={`flex-1 rounded-md border p-2 text-xs transition-opacity ${
                      isFocused ? "ring-primary ring-2" : ""
                    } ${isFaded ? "opacity-[0.15]" : ""} ${
                      hasBreach
                        ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                        : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    }`}
                    style={{ minWidth: 120 }}
                  >
                    <div className="text-muted-foreground mb-1 truncate font-medium">
                      {wh.warehouseName}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        hasBreach
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {wh.kpi.breachCount} breaches
                    </div>
                    <div className="text-muted-foreground">
                      {wh.kpi.breachPercentage.toFixed(1)}% of{" "}
                      {wh.kpi.totalWindows} windows
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS (may need adjustments based on exact shadcn chart exports)

---

### Task 8: Integrate Card into Head Office Dashboard

**Files:**

- Modify: `src/modules/dashboard/components/head-office-dashboard.tsx:179-184`

**Step 1: Add import**

Add to imports in `head-office-dashboard.tsx`:

```typescript
import { TemperatureTimeseriesCard } from "./temperature-timeseries-card";
```

**Step 2: Replace first "Coming Soon" card (lines 179-184)**

Replace:

```tsx
{
  /* Coming Soon Cards */
}
<Card className="flex flex-col">
  <CardContent className="flex flex-1 items-center justify-center p-6">
    <p className="text-muted-foreground text-lg font-medium">Coming Soon</p>
  </CardContent>
</Card>;
```

With:

```tsx
{
  /* Temperature Timeseries Card */
}
<TemperatureTimeseriesCard />;
```

**Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 4: Verify dev server renders**

Run: `pnpm dev`
Expected: Dashboard loads with the temperature timeseries card in the top-right position. Combobox and date presets visible. "Select a concessionaire" message shown when no concess selected.

---

### Task 9: Verify Full Integration

**Step 1: Run full typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 2: Run linter**

Run: `pnpm lint`
Expected: PASS (fix any lint errors)

**Step 3: Run tests**

Run: `pnpm test:run`
Expected: All existing tests pass

**Step 4: Manual verification checklist**

Run the dev server and verify:

- [ ] Combobox (Popover+Command) opens, searches with debounce, scrolls to load more pages
- [ ] Selecting a concessionaire loads the chart
- [ ] Skeleton shows while loading
- [ ] Date presets (24h, 7d, 30d) switch correctly, 30d is default
- [ ] Custom date picker opens calendar popover and applies range
- [ ] Multiple warehouse lines render with distinct colors
- [ ] -10°C threshold line is visible (dashed red)
- [ ] Clicking a line focuses it, others fade to 0.15 opacity
- [ ] Clicking same line again resets focus
- [ ] Legend click also triggers focus
- [ ] KPI cards show below chart, color-coded green/red
- [ ] KPI cards highlight when matching focused warehouse
- [ ] "Select a concessionaire" message shows when none selected
