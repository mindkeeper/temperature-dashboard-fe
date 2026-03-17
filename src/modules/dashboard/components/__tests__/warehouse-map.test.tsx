import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { WarehouseTemperatureAggregate } from "../../hooks/use-warehouse-temperatures";
import { WarehouseMap } from "../warehouse-map";

// Mock Mapbox
vi.mock("react-map-gl/mapbox", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mapbox-map">{children}</div>
  ),
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-popup">{children}</div>
  ),
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

    const markers = getAllByTestId("map-marker");
    expect(markers).toHaveLength(3);
  });

  it("filters to warehouses with offline devices when offlineDevices filter active", () => {
    const warehousesWithOffline: WarehouseTemperatureAggregate[] = [
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
        reportingDeviceCount: 8, // 2 offline
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
        reportingDeviceCount: 10, // 0 offline
        lastUpdate: Date.now(),
        status: "orange",
      },
    ];

    const { getAllByTestId } = render(
      <WarehouseMap warehouses={warehousesWithOffline} filter="offlineDevices" />
    );

    const markers = getAllByTestId("map-marker");
    expect(markers).toHaveLength(1); // Only w1 has offline devices
  });

  it("filters to warehouses at risk (orange/red) when atRisk filter active", () => {
    const { getAllByTestId } = render(<WarehouseMap warehouses={mockWarehouses} filter="atRisk" />);

    const markers = getAllByTestId("map-marker");
    expect(markers).toHaveLength(2); // w2 (orange) and w3 (red)
  });

  it("filters to stale warehouses when staleData filter active", () => {
    const now = Date.now();
    const warehousesWithStale: WarehouseTemperatureAggregate[] = [
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
        lastUpdate: now - 10 * 60 * 1000, // 10 min - fresh
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
        lastUpdate: now - 20 * 60 * 1000, // 20 min - stale
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
        lastUpdate: null, // No data - stale
        status: "red",
      },
    ];

    const { getAllByTestId } = render(
      <WarehouseMap warehouses={warehousesWithStale} filter="staleData" />
    );

    const markers = getAllByTestId("map-marker");
    expect(markers).toHaveLength(2); // w2 and w3 are stale
  });
});
