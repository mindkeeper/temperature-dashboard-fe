import { useMemo } from "react";

import { useAuth } from "@/modules/auth";
import { useConcessionaire } from "@/modules/dashboard/hooks/use-concessionaire";
import { useTemperature } from "@/modules/dashboard/hooks/use-temperature";

interface WarehouseTemperature {
  warehouseId: string;
  warehouseName: string;
  temperature: number;
  unit: string;
  deviceSerialNumber: string;
  lastUpdate: number;
}

export function ConcessionaireDashboard() {
  const { user } = useAuth();
  const concessId = user?.concessionaries[0]?.concessionaireId;
  const { data } = useConcessionaire(concessId ?? "");
  const warehouses = useMemo(() => data?.warehouses ?? [], [data?.warehouses]);

  // Single source of truth for all temperature data via WebSocket
  const { data: temperatureMap = {} } = useTemperature();

  // Map temperature data to warehouses
  const warehouseTemperatures = useMemo<WarehouseTemperature[]>(() => {
    return warehouses
      .map((warehouse) => {
        // Find the first active device in the warehouse
        const device = warehouse.devices.find((d) => d.isActive);
        if (!device) return null;

        // Get temperature for this device's serial number
        const tempData = temperatureMap[device.serialNumber];
        if (!tempData) return null;

        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          temperature: tempData.temp,
          unit: tempData.unit,
          deviceSerialNumber: tempData.sn,
          lastUpdate: tempData.ts,
        };
      })
      .filter((item): item is WarehouseTemperature => item !== null);
  }, [warehouses, temperatureMap]);

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Temperature Dashboard</h1>
        <p className="text-muted-foreground">Real-time temperature monitoring for warehouses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouseTemperatures.length === 0 ? (
          <div className="text-muted-foreground col-span-full text-center">
            Waiting for temperature data...
          </div>
        ) : (
          warehouseTemperatures.map((wt) => (
            <div key={wt.warehouseId} className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{wt.warehouseName}</h3>
                  <p className="text-muted-foreground text-xs">{wt.deviceSerialNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {wt.temperature}°{wt.unit}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
