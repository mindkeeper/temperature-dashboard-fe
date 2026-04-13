import {
  ChevronDown,
  ChevronRight,
  Link,
  Loader2,
  Settings,
  WifiOff,
  Cpu,
  Activity,
} from "lucide-react";
import { useState, useMemo, Fragment } from "react";

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

import { useConnectGateway } from "../hooks/use-connect-gateway";
import type {
  DeviceListItem,
  SyncStatus,
  GatewayProvisionStatus,
} from "../types/device-config.types";

import { AddSensorModal } from "./add-sensor-modal";

interface DeviceTableProps {
  devices: DeviceListItem[];
  onConfigure: (device: DeviceListItem) => void;
}

function getSyncBadge(status: SyncStatus) {
  switch (status) {
    case "SYNCED":
      return (
        <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
          <Activity className="h-3 w-3" />
          Synced
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
          Pending Sync
        </Badge>
      );
    case "ERROR":
      return <Badge variant="destructive">Sync Error</Badge>;
  }
}

function getGatewayBadge(status: GatewayProvisionStatus) {
  switch (status) {
    case "PROVISIONED":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          Provisioned
        </Badge>
      );
    case "READY":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
          Awaiting Provisioning
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Pending
        </Badge>
      );
  }
}

function ConnectGatewayButton({ gateway }: { gateway: DeviceListItem["gateway"] }) {
  const connectGateway = useConnectGateway();

  if (gateway?.provisionStatus !== "PENDING") {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
      disabled={connectGateway.isPending}
      onClick={(e) => {
        e.stopPropagation();
        if (gateway.id) {
          connectGateway.mutate(gateway.id);
        }
      }}
    >
      {connectGateway.isPending ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Link className="mr-1 h-3.5 w-3.5" />
      )}
      Connect
    </Button>
  );
}

export function DeviceTable({ devices, onConfigure }: DeviceTableProps) {
  const [expandedGateways, setExpandedGateways] = useState<Record<string, boolean>>({});

  const toggleGateway = (gatewayId: string) => {
    setExpandedGateways((prev) => ({
      ...prev,
      [gatewayId]: !prev[gatewayId],
    }));
  };

  // Group devices by gateway
  const groupedData = useMemo(() => {
    const groups: Record<
      string,
      { gateway: DeviceListItem["gateway"]; sensors: DeviceListItem[] }
    > = {};

    devices.forEach((device) => {
      const gatewayId = device.gateway?.id ?? "unlinked";
      groups[gatewayId] ??= {
        gateway: device.gateway,
        sensors: [],
      };
      groups[gatewayId].sensors.push(device);
    });

    return Object.entries(groups);
  }, [devices]);

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
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Identifier (IMEI / SN)</TableHead>
            <TableHead className="hidden md:table-cell">Model</TableHead>
            <TableHead className="hidden lg:table-cell">Warehouse</TableHead>
            <TableHead>Gateway Status</TableHead>
            <TableHead>Sync Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedData.map(([gatewayId, { gateway, sensors }]) => {
            const isExpanded = !!expandedGateways[gatewayId];

            return (
              <Fragment key={gatewayId}>
                {/* Gateway Row */}
                <TableRow
                  className="bg-muted/20 hover:bg-muted/30 cursor-pointer"
                  onClick={() => {
                    toggleGateway(gatewayId);
                  }}
                >
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-600" />
                      <span>{gateway?.imei ?? "Unlinked Gateway"}</span>
                      <Badge
                        variant="outline"
                        className="px-1 py-0 text-[10px] font-normal uppercase"
                      >
                        Gateway
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">—</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {sensors[0]?.warehouse.name}
                  </TableCell>
                  <TableCell>
                    {gateway ? (
                      getGatewayBadge(gateway.provisionStatus)
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ConnectGatewayButton gateway={gateway} />
                      {gateway && (
                        <AddSensorModal
                          gatewayId={gateway.id}
                          gatewayImei={gateway.imei}
                          warehouseId={gateway.warehouseId}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Sensor Rows */}
                {isExpanded &&
                  sensors.map((sensor) => (
                    <TableRow key={sensor.id} className="hover:bg-muted/10 group">
                      <TableCell></TableCell>
                      <TableCell className="pl-8">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-medium">
                            {sensor.serialNumber}
                          </span>
                          <span className="text-muted-foreground text-[10px]">Sensor</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden italic md:table-cell">
                        {sensor.modelname ?? "Standard Probe"}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {sensor.warehouse.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell>{getSyncBadge(sensor.syncStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    id={`configure-device-${sensor.id}`}
                                    size="sm"
                                    variant="outline"
                                    disabled={gateway?.provisionStatus !== "PROVISIONED"}
                                    onClick={() => {
                                      onConfigure(sensor);
                                    }}
                                    className="h-8 gap-1.5"
                                  >
                                    <Settings className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Configure</span>
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {gateway?.provisionStatus !== "PROVISIONED" && (
                                <TooltipContent>
                                  <p>Gateway must be PROVISIONED to configure sensors.</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
