import { ChevronLeft, ChevronRight, Loader2, Radio, Search, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConcessionaireCombobox } from "@/modules/dashboard/components/concessionaire-combobox";

import { useDevices } from "../hooks/use-devices";
import type { DeviceListItem } from "../types/device-config.types";

import { AddDeviceModal } from "./add-device-modal";
import { ConfigureModal } from "./configure-modal";
import { DeviceTable } from "./device-table";

export function DeviceConfigPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [concessionaireId, setConcessionaireId] = useState<string | null>(null);

  const [selectedDevice, setSelectedDevice] = useState<DeviceListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useDevices({
    page,
    limit: 10,
    q: debouncedSearch,
    concessionaireId: concessionaireId ?? undefined,
  });

  const devices = data?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const pagination = data?.meta?.pagination;

  function handleConfigure(device: DeviceListItem) {
    setSelectedDevice(device);
    setIsModalOpen(true);
  }

  function handleModalClose(open: boolean) {
    if (!open) {
      setSelectedDevice(null);
    }
    setIsModalOpen(open);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Device Configuration</h1>
            <p className="text-muted-foreground text-sm">
              Remotely configure sensors connected to Teltonika gateways
            </p>
          </div>
        </div>
      </div>

      {/* Device Table Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Registered Devices</CardTitle>
              <CardDescription>
                {pagination
                  ? `Showing ${String(devices.length)} of ${String(pagination.total)} devices`
                  : "Loading devices..."}
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddDeviceModal />
              <div className="bg-border mx-1 hidden h-8 w-px sm:block" />

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    placeholder="Search serial number..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1); // Reset to page 1 on search
                    }}
                  />
                </div>

                <ConcessionaireCombobox
                  value={concessionaireId}
                  onValueChange={(id) => {
                    setConcessionaireId(id);
                    setPage(1); // Reset to page 1 on filter
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12">
              <TriangleAlert className="mb-3 h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-700">Failed to load devices</p>
              <p className="mt-1 text-xs text-red-600">
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
            </div>
          )}

          {/* Device Table */}
          {!isLoading && !isError && (
            <>
              <DeviceTable devices={devices} onConfigure={handleConfigure} />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => {
                        setPage((p) => p + 1);
                      }}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Configure Modal */}
      <ConfigureModal device={selectedDevice} open={isModalOpen} onOpenChange={handleModalClose} />
    </div>
  );
}
