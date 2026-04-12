import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Link, Loader2, Settings, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useConnectDevice } from "../hooks/use-connect-device";
import type { DeviceListItem } from "../types/device-config.types";

interface DeviceTableProps {
  devices: DeviceListItem[];
  onConfigure: (device: DeviceListItem) => void;
}

function getProvisionBadge(status: DeviceListItem["provisionStatus"]) {
  switch (status) {
    case "PROVISIONED":
      return (
        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
          Online
        </Badge>
      );
    case "READY_FOR_PROVISIONING":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 whitespace-nowrap text-amber-700 hover:bg-amber-200"
        >
          Awaiting Connection
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
          Not Provisioned
        </Badge>
      );
  }
}

export function DeviceTable({ devices, onConfigure }: DeviceTableProps) {
  const connectDevice = useConnectDevice();

  const columns: ColumnDef<DeviceListItem>[] = [
    {
      accessorKey: "serialNumber",
      header: "Serial Number",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">{row.original.serialNumber}</span>
      ),
    },
    {
      accessorKey: "modelname",
      header: "Model",
      cell: ({ row }) => (
        <span className="text-muted-foreground hidden md:inline">
          {row.original.modelname ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "warehouse.name",
      header: "Warehouse",
      cell: ({ row }) => <span className="hidden lg:inline">{row.original.warehouse.name}</span>,
    },
    {
      accessorKey: "warehouse.concessionaire.name",
      header: "Concessionaire",
      cell: ({ row }) => (
        <span className="hidden lg:inline">{row.original.warehouse.concessionaire.name}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    },
    {
      accessorKey: "provisionStatus",
      header: "Gateway",
      cell: ({ row }) => getProvisionBadge(row.original.provisionStatus),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => {
        const device = row.original;
        const isOnline = device.isActive && device.provisionStatus === "PROVISIONED";
        const canConfigure = isOnline;

        return (
          <div className="flex justify-end gap-2 text-right">
            {device.provisionStatus === "PENDING" ? (
              <Button
                size="sm"
                variant="default"
                disabled={connectDevice.isPending}
                onClick={() => {
                  connectDevice.mutate(device.id);
                }}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
              >
                {connectDevice.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Connect</span>
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <Button
                        id={`configure-device-${device.id}`}
                        size="sm"
                        variant="outline"
                        disabled={!canConfigure}
                        onClick={() => {
                          onConfigure(device);
                        }}
                        className="gap-1.5"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Configure</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canConfigure && (
                    <TooltipContent>
                      <p>
                        {!device.isActive
                          ? "Device is inactive"
                          : "Gateway is not online. Only PROVISIONED devices can be configured."}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <WifiOff className="text-muted-foreground mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm font-medium">No devices found</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Try adjusting your filters or add devices using the button above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                let className = "";
                if (header.id === "modelname") className = "hidden md:table-cell";
                if (
                  header.id === "warehouse_name" ||
                  header.id === "warehouse_concessionaire_name"
                ) {
                  className = "hidden lg:table-cell";
                }

                return (
                  <TableHead key={header.id} className={className}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/30">
              {row.getVisibleCells().map((cell) => {
                let className = "";
                if (cell.column.id === "modelname") className = "hidden md:table-cell";
                if (
                  cell.column.id === "warehouse_name" ||
                  cell.column.id === "warehouse_concessionaire_name"
                ) {
                  className = "hidden lg:table-cell";
                }

                return (
                  <TableCell key={cell.id} className={className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
