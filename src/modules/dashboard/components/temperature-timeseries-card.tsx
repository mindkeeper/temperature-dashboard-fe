import { format } from "date-fns";
import { Download, Thermometer } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { statsService } from "@/services/stats";

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

interface TemperatureTimeseriesCardProps {
  initialConcessId?: string;
}

export function TemperatureTimeseriesCard({ initialConcessId }: TemperatureTimeseriesCardProps) {
  const [selectedConcessId, setSelectedConcessId] = useState<string | null>(
    initialConcessId ?? null
  );
  const [_selectedConcessName, setSelectedConcessName] = useState<string | null>(null);
  const [focusedWarehouseId, setFocusedWarehouseId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(() => ({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  }));

  // Brush-controlled pan state (moved before callbacks that reference it)
  const [brushRange, setBrushRange] = useState<{ startIndex: number; endIndex: number } | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleConcessChange = useCallback((id: string | null, name: string | null) => {
    setSelectedConcessId(id);
    setSelectedConcessName(name);
    setFocusedWarehouseId(null);
    setBrushRange(null);
  }, []);

  const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    setBrushRange(null);
  }, []);

  const { data: warehouses, isLoading } = useTimeseries(
    selectedConcessId
      ? {
          concessId: selectedConcessId,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        }
      : null
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
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
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
    setFocusedWarehouseId((current) => (current === warehouseId ? null : warehouseId));
  }, []);

  const handleChartClick = useCallback((e: React.MouseEvent) => {
    // Only reset if clicking on the chart background (not a line)
    const target = e.target as HTMLElement;
    if (target.tagName === "svg" || target.classList.contains("recharts-surface")) {
      setFocusedWarehouseId(null);
    }
  }, []);

  const handleBrushChange = useCallback((newRange: { startIndex?: number; endIndex?: number }) => {
    if (newRange.startIndex !== undefined && newRange.endIndex !== undefined) {
      setBrushRange({ startIndex: newRange.startIndex, endIndex: newRange.endIndex });
    }
  }, []);

  // Drag-to-pan handlers
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startBrush: { startIndex: number; endIndex: number };
  } | null>(null);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!brushRange || chartData.length === 0) return;
      dragRef.current = {
        dragging: true,
        startX: e.clientX,
        startBrush: { ...brushRange },
      };
    },
    [brushRange, chartData.length]
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag?.dragging || chartData.length === 0) return;

      const chartEl = e.currentTarget as HTMLElement;
      const chartWidth = chartEl.clientWidth;
      const windowSize = drag.startBrush.endIndex - drag.startBrush.startIndex;
      const totalPoints = chartData.length;

      // Convert pixel delta to index delta
      const dx = drag.startX - e.clientX; // positive = drag left = move forward in data
      const indexDelta = Math.round((dx / chartWidth) * totalPoints);

      if (indexDelta === 0) return;

      let newStart = drag.startBrush.startIndex + indexDelta;
      let newEnd = drag.startBrush.endIndex + indexDelta;

      // Clamp to data bounds
      if (newStart < 0) {
        newStart = 0;
        newEnd = windowSize;
      }
      if (newEnd >= totalPoints) {
        newEnd = totalPoints - 1;
        newStart = newEnd - windowSize;
      }

      setBrushRange({ startIndex: newStart, endIndex: newEnd });
    },
    [chartData.length]
  );

  const handleDragEnd = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null;
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedConcessId) return;
    setIsExporting(true);
    try {
      const blob = await statsService.exportTimeseries({
        concessId: selectedConcessId,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `temperature-export-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [selectedConcessId, dateRange]);

  return (
    <Card className="flex shrink-0 flex-col" style={{ height: 520 }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Thermometer className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Temperature Timeseries
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedConcessId || isLoading || isExporting}
          onClick={() => {
            void handleExport();
          }}
          className="flex items-center gap-1.5"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </CardHeader>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2 px-6 pb-2">
        {!initialConcessId && (
          <ConcessionaireCombobox value={selectedConcessId} onValueChange={handleConcessChange} />
        )}
        <DateRangePresets
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      <CardContent className="flex min-h-0 flex-1 flex-col p-6 pt-0">
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
            <p className="text-muted-foreground text-sm">No timeseries data available</p>
          </div>
        ) : (
          /* Chart + KPI */
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {/* Chart */}
            <div
              className="min-h-0 flex-1"
              style={{ cursor: brushRange ? "grab" : undefined }}
              role="button"
              tabIndex={0}
              onClick={handleChartClick}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setFocusedWarehouseId(null);
                }
              }}
            >
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="formattedTime"
                    tick={{ fontSize: 14 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    reversed
                    tick={{ fontSize: 14 }}
                    tickFormatter={(val: number) => `${val.toString()}°C`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend
                    onClick={(e) => {
                      if (e.dataKey) handleLineClick(e.dataKey as string);
                    }}
                    wrapperStyle={{ cursor: "pointer", fontSize: 14 }}
                  />
                  <Brush
                    dataKey="formattedTime"
                    height={30}
                    stroke="var(--chart-1)"
                    travellerWidth={10}
                    startIndex={brushRange?.startIndex}
                    endIndex={brushRange?.endIndex}
                    onChange={handleBrushChange}
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
                      strokeWidth={focusedWarehouseId === wh.warehouseId ? 4 : 2}
                      opacity={
                        focusedWarehouseId === null || focusedWarehouseId === wh.warehouseId
                          ? 1
                          : 0.15
                      }
                      dot={false}
                      activeDot={{ r: 4 }}
                      onClick={() => {
                        handleLineClick(wh.warehouseId);
                      }}
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
                const hasBreach = wh.kpi.breachCount > 0;

                return (
                  <div
                    key={wh.warehouseId}
                    className={`flex-1 rounded-md border p-3 transition-opacity ${
                      isFocused ? "ring-primary ring-2" : ""
                    } ${isFaded ? "opacity-[0.15]" : ""} ${
                      hasBreach
                        ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                        : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    }`}
                    style={{ minWidth: 120 }}
                  >
                    <div className="text-muted-foreground mb-1 truncate text-sm font-medium">
                      {wh.warehouseName}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        hasBreach
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {wh.kpi.breachCount} breaches
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {wh.kpi.totalDurationMinutes !== null
                        ? `${wh.kpi.totalDurationMinutes} min total`
                        : "No breaches"}
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
