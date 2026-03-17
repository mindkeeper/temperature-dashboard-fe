import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as useConcessionaireModule from "../../hooks/use-concessionaire";
import * as useTemperatureModule from "../../hooks/use-temperature";
import { HeadOfficeDashboard } from "../head-office-dashboard";

// Mock hooks
vi.mock("../../hooks/use-concessionaire");
vi.mock("../../hooks/use-temperature");

// Mock WarehouseMap component
vi.mock("../warehouse-map", () => ({
  WarehouseMap: ({ warehouses }: { warehouses: unknown[] }) => (
    <div data-testid="warehouse-map">Map with {warehouses.length} warehouses</div>
  ),
}));

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

describe("HeadOfficeDashboard", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(useConcessionaireModule.useAllConcessionaires).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 500, total: 0, totalPages: 1 } },
      },
      isLoading: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(useTemperatureModule.useTemperature).mockReturnValue({
      data: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("renders warehouse map", () => {
    render(<HeadOfficeDashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId("warehouse-map")).toBeInTheDocument();
  });
});

describe("HeadOfficeDashboard - Filter State", () => {
  it("toggles offline devices filter when clicking Active Devices card", async () => {
    const user = userEvent.setup();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(useTemperatureModule.useTemperature).mockReturnValue({
      data: {
        SN001: { sn: "SN001", temp: -20, unit: "C", ts: Date.now() },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<HeadOfficeDashboard />, { wrapper: createWrapper() });

    const activeDevicesCard = screen.getByText("Active Devices").closest("[role='button']");
    expect(activeDevicesCard).toBeInTheDocument();

    // Click to activate filter
    if (activeDevicesCard) {
      await user.click(activeDevicesCard);
    }
    expect(screen.getByText(/Viewing offline devices/i)).toBeInTheDocument();

    // Click again to deactivate
    if (activeDevicesCard) {
      await user.click(activeDevicesCard);
    }
    expect(screen.queryByText(/Viewing offline devices/i)).not.toBeInTheDocument();
  });
});
