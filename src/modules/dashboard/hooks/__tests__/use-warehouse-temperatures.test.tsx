import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect } from "vitest";

import type { Concessionaire } from "@/services/concessionaire";

import { useWarehouseTemperatures } from "../use-warehouse-temperatures";

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

    const { result } = renderHook(() => useWarehouseTemperatures(concessionaires, temperatureMap), {
      wrapper: createWrapper(),
    });

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

    const { result } = renderHook(() => useWarehouseTemperatures(concessionaires, temperatureMap), {
      wrapper: createWrapper(),
    });

    expect(result.current[0]?.status).toBe("green");
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

    const { result } = renderHook(() => useWarehouseTemperatures(concessionaires, temperatureMap), {
      wrapper: createWrapper(),
    });

    expect(result.current[0]?.status).toBe("orange");
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

    const { result } = renderHook(() => useWarehouseTemperatures(concessionaires, temperatureMap), {
      wrapper: createWrapper(),
    });

    expect(result.current[0]?.status).toBe("red");
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

    const { result } = renderHook(() => useWarehouseTemperatures(concessionaires, temperatureMap), {
      wrapper: createWrapper(),
    });

    expect(result.current[0]?.status).toBe("gray");
    expect(result.current[0]?.averageTemperature).toBeNull();
    expect(result.current[0]?.reportingDeviceCount).toBe(0);
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

    const { result } = renderHook(() => useWarehouseTemperatures(concessionaires, temperatureMap), {
      wrapper: createWrapper(),
    });

    expect(result.current[0]?.deviceCount).toBe(1);
    expect(result.current[0]?.reportingDeviceCount).toBe(1);
    expect(result.current[0]?.averageTemperature).toBe(-20);
  });
});
