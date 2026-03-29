# Temperature Timeseries Card — Design Document

**Date:** 2026-03-28
**Location:** Head Office Dashboard, top-right position (replaces first "Coming Soon" card)

## Overview

A new card on the head office dashboard that displays a line chart of temperature timeseries data per concessionaire. Users select a concessionaire via a searchable combobox, choose a date range, and view multi-warehouse temperature trends with KPI metrics.

## API Integration

**Endpoint:** `GET /api/v1/stats/timeseries`

**Query params:**

- `concessId` — concessionaire ID (from combobox selection)
- `startDate` — ISO 8601 datetime
- `endDate` — ISO 8601 datetime
- `interval` — optional, auto-scaled by backend based on date range

**Response:** `WarehouseTimeseriesDto[]`

```typescript
{
  warehouseId: string
  warehouseName: string
  series: { timestamp: string, temperature: number }[]
  kpi: {
    breachCount: number      // windows where avg temp > -10°C
    totalWindows: number
    breachPercentage: number
  }
}
```

## Component Architecture

### Files

**New files:**

- `src/modules/dashboard/components/temperature-timeseries-card.tsx` — main card component
- `src/modules/dashboard/hooks/use-timeseries.ts` — TanStack query hook for timeseries API
- `src/services/stats.ts` — stats API service layer

**Modified files:**

- `src/modules/dashboard/hooks/use-concessionaire.ts` — add `useConcessionaireInfinite` hook
- `src/modules/dashboard/components/head-office-dashboard.tsx` — replace first "Coming Soon" card

### Dependencies to Install

- `recharts` — required by shadcn chart component
- `react-day-picker` — required by shadcn calendar component
- `date-fns` — date formatting and manipulation

### shadcn Components to Add

- `chart` — wrapper around recharts with theming
- `calendar` — date picker (react-day-picker based)
- `popover` — for custom date range picker
- `combobox` — searchable select for concessionaire selection

## Component: `temperature-timeseries-card.tsx`

### Local State

- `selectedConcessId: string | null` — from combobox
- `dateRange: { startDate: Date, endDate: Date }` — from presets or custom calendar
- `focusedWarehouseId: string | null` — from line click interaction

### Visual States

1. **No concess selected** — message: "Select a concessionaire to view temperature trends"
2. **Loading** — skeleton placeholder inside the card
3. **Data loaded** — combobox + date presets + line chart + KPI row

### Card Header Layout

Left side: concessionaire combobox
Right side: date range preset buttons + custom range button

## Concessionaire Combobox

- Uses shadcn `combobox` component
- Search input debounced using `useDebounce` from `usehooks-ts`
- Backed by `useInfiniteQuery` from TanStack
  - Calls `GET /api/v1/concessionaires?q={debouncedSearch}&page={n}&limit=10`
  - `getNextPageParam` derived from `meta.pagination.totalPages > currentPage`
- Infinite scroll via `IntersectionObserver` on a sentinel div at the bottom of the list
- Each option: concessionaire name (display), concessionaire ID (value)
- Query key: `["concessionaires", "infinite", debouncedSearch]`

## Date Range Presets + Custom Range

### Preset Buttons

Row of `Button` components (`size="sm"`):

- "24h" → last 24 hours
- "7d" → last 7 days
- **"30d" → last 30 days (default on load)**

Active preset: `default` variant. Inactive: `outline` variant.

### Custom Range

A "Custom" button that opens a `Popover` with a `Calendar` in range mode. On selection, preset buttons deselect and "Custom" shows as active.

## Line Chart

- Uses shadcn `ChartContainer` with recharts `LineChart`
- **X-axis:** timestamps, formatted contextually ("Mar 25 14:00" for wider ranges, "14:30" for 24h)
- **Y-axis:** temperature in °C
- **Lines:** one `<Line>` per warehouse, colored using shadcn chart color tokens (`--chart-1`, `--chart-2`, etc.)
- **Threshold:** `<ReferenceLine y={-10}` — dashed red line with label "-10°C"
- **Tooltip:** shows timestamp, warehouse name, temperature value
- **Legend:** warehouse names with color indicators at bottom

### Focus Interaction

- Click a `<Line>` → sets `focusedWarehouseId`, other lines fade to `opacity: 0.15`
- Click same line again or chart background → resets focus (all lines full opacity)
- Clicking a legend item also triggers focus
- Focused line stays at `opacity: 1`

## KPI Row

Below the chart, a horizontal flex row of small metric cards (wraps if needed).

Each card shows:

- **Warehouse name** as label
- **Breach count** — windows where temp was above -10°C
- **Breach percentage** — e.g. "2.3% breach"
- Color: green if 0% breach, red if > 0%

When `focusedWarehouseId` is set:

- Matching KPI card gets highlighted border/ring
- Other cards fade (same opacity pattern as chart lines)

Single warehouse still renders one KPI card for consistency.

## Data Flow

```
User selects concessionaire (combobox)
  → selectedConcessId set
  → useTimeseries fires: GET /api/v1/stats/timeseries?concessId={id}&startDate={start}&endDate={end}
  → Response: WarehouseTimeseriesDto[]
  → Chart renders one <Line> per warehouse
  → KPI row renders one card per warehouse

User changes date preset or custom range
  → dateRange updates → useTimeseries refetches

User clicks a warehouse line
  → focusedWarehouseId set → other lines fade, matching KPI highlights

User scrolls combobox dropdown
  → IntersectionObserver triggers fetchNextPage → more concessionaires load
```
