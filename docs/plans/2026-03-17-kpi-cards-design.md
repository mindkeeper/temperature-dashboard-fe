# KPI Cards Design Specification

**Date**: 2026-03-17
**Status**: Approved
**Context**: Head Office Dashboard - Temperature Monitoring System

## Overview

Add 4 interactive KPI cards to the dashboard that provide quick assessment of system health and enable drill-down filtering of the warehouse map.

## Design Principles

- **Balanced overview**: Mix of alerts, performance, and coverage metrics
- **Action-oriented**: Cards enable drill-down to filter map and investigate issues
- **Visual hierarchy**: Icons + primary metric + secondary details
- **Real-time**: Reflect live WebSocket data updates

## KPI Card Specifications

### 1. Active Devices

**Purpose**: Monitor device connectivity and identify offline sensors

**Metrics**:

- Primary: Total active devices count (e.g., "280 devices")
- Secondary: Online/offline split (e.g., "245 online • 35 offline")
- Visual: Percentage indicator (e.g., "87% online")

**Visual Design**:

- Icon: `Radio` (top-left, small, blue)
- Color: Blue for active, gray/red accent for offline

**Interaction**:

- Click: Filter map to show only warehouses with offline devices
- Active state: Border highlight + "Viewing offline devices" label
- Hover: Elevation + pointer cursor

**Data Source**:

```typescript
activeDevices = warehouses.reduce((sum, w) => sum + w.deviceCount, 0);
onlineDevices = warehouses.reduce((sum, w) => sum + w.reportingDeviceCount, 0);
offlineDevices = activeDevices - onlineDevices;
```

### 2. Warehouses at Risk

**Purpose**: Highlight warehouses with temperature issues requiring attention

**Metrics**:

- Primary: Count of warehouses with orange/red status (e.g., "3 warehouses")
- Secondary: Breakdown by severity (e.g., "2 critical • 1 warning")
- Visual: Red badge when > 0, green checkmark when 0

**Visual Design**:

- Icon: `AlertTriangle` (top-left, small, adaptive color)
- Color: Red when issues exist, green when all clear

**Interaction**:

- Click: Filter map to show only orange/red status warehouses
- Active state: Border highlight + "Viewing at-risk warehouses" label
- Hover: Elevation + pointer cursor

**Data Source**:

```typescript
atRisk = warehouses.filter((w) => w.status === "orange" || w.status === "red");
critical = warehouses.filter((w) => w.status === "red").length;
warning = warehouses.filter((w) => w.status === "orange").length;
```

### 3. Data Freshness

**Purpose**: Identify warehouses with stale data that may indicate connectivity issues

**Metrics**:

- Primary: Count of warehouses with stale data (e.g., "2 warehouses")
- Secondary: Threshold description (e.g., "No updates for 15+ min")
- Visual: Green when 0, yellow/red when issues exist

**Visual Design**:

- Icon: `Clock` or `RefreshCw` (top-left, small, status-colored)
- Color: Green (0 stale), yellow (1-3 stale), red (>3 stale)

**Interaction**:

- Click: Filter map to show only warehouses with stale data
- Active state: Border highlight + "Viewing stale warehouses" label
- Hover: Elevation + pointer cursor

**Data Source**:

```typescript
STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
currentTime = Date.now();
staleWarehouses = warehouses.filter(
  (w) => w.lastUpdate === null || currentTime - w.lastUpdate > STALE_THRESHOLD_MS
);
```

### 4. Average System Temperature

**Purpose**: Show overall system temperature health at a glance

**Metrics**:

- Primary: Overall average temperature (e.g., "-22.4°C")
- Secondary: Data source context (e.g., "Across 245 sensors")
- Visual: Status dot (green/orange/red) based on thresholds

**Visual Design**:

- Icon: `Thermometer` (top-left, small, status-colored)
- Color: Matches temperature threshold (≤-20°C green, -19 to -11°C orange, ≥-10°C red)

**Interaction**:

- Click: None - informational only
- Hover: No special state (non-interactive)

**Data Source**:

```typescript
allReadings = warehouses
  .filter((w) => w.averageTemperature !== null)
  .map((w) => w.averageTemperature);

avgTemp =
  allReadings.length > 0
    ? allReadings.reduce((sum, temp) => sum + temp, 0) / allReadings.length
    : null;

sensorCount = warehouses.reduce((sum, w) => sum + w.reportingDeviceCount, 0);
```

## Interaction Patterns

### Hover States

- Subtle elevation/shadow increase (interactive cards only)
- Cursor changes to pointer
- No tooltip needed (action is intuitive)

### Active/Selected States

- Colored border or background tint when filtering
- Show active filter label below card title
- Small "×" button to clear individual filter
- Multiple cards can be active simultaneously (AND logic)

### Data Updates

- Pulse animation on metrics when WebSocket updates change values
- "Last updated: Xs ago" indicator (optional, based on space)
- Stale data warning if no WebSocket connection

### Empty/Error States

- No devices reporting: Show "—" instead of "0"
- All warehouses healthy: Green checkmark + "All clear"
- WebSocket disconnected: Warning indicator on all cards

## Layout

### Card Structure

```
┌─────────────────────────────┐
│ 🔹 Card Title               │
│                             │
│   [Large Primary Number]    │
│   Small secondary detail    │
│                             │
│   [Visual indicator]        │
└─────────────────────────────┘
```

### Dashboard Grid Placement

Replace "Coming Soon" placeholder in top-left quadrant with 4 KPI cards in a 2×2 or 4×1 layout (responsive).

## Technical Considerations

### State Management

- Add filter state to dashboard component (which cards are active)
- Pass filter state to WarehouseMap component
- WarehouseMap filters pins based on active filters

### Performance

- Calculations are memoized (already using useMemo in useWarehouseTemperatures)
- Filter operations on already-aggregated data (no raw device iteration)
- WebSocket updates trigger React Query cache updates → automatic re-render

### Accessibility

- Cards have proper ARIA labels
- Keyboard navigation support (Enter/Space to activate filter)
- Focus management when filters change
- Screen reader announcements for filter state changes

## Future Enhancements (Out of Scope)

- Historical trends (requires backend changes)
- Configurable thresholds per warehouse
- Export/download reports from KPI data
- Push notifications when thresholds exceeded
- Custom date ranges for freshness threshold
