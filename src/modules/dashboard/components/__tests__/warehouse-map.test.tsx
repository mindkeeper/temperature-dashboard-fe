import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { WarehouseTemperatureAggregate } from "../../hooks/use-warehouse-temperatures";
import { WarehouseMap } from "../warehouse-map";

// Mock the Google Maps library
vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Map: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="google-map">{children}</div>
  ),
  AdvancedMarker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-marker">{children}</div>
  ),
  InfoWindow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="info-window">{children}</div>
  ),
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
