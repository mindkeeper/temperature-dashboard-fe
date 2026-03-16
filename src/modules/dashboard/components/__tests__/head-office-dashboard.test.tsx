import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";

import { HeadOfficeDashboard } from "../head-office-dashboard";

// Mock hooks
vi.mock("../../hooks/use-concessionaire", () => ({
  useAllConcessionaires: vi.fn(() => ({
    data: {
      data: [],
      meta: { pagination: { page: 1, limit: 500, total: 0, totalPages: 1 } },
    },
    isLoading: false,
    error: null,
  })),
}));

vi.mock("../../hooks/use-temperature", () => ({
  useTemperature: vi.fn(() => ({
    data: {},
  })),
}));

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
  it("renders dashboard header", () => {
    render(<HeadOfficeDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/head office dashboard/i)).toBeInTheDocument();
  });

  it("renders warehouse map", () => {
    render(<HeadOfficeDashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId("warehouse-map")).toBeInTheDocument();
  });
});
