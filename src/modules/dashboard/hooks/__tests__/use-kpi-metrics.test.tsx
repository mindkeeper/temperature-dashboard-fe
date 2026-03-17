import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useKpiMetrics } from "../use-kpi-metrics";
import type { WarehouseTemperatureAggregate } from "../use-warehouse-temperatures";

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
