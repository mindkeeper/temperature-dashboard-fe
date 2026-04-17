import { formatDistanceToNowStrict } from "date-fns";

import { cn } from "@/lib/utils";

interface ConcessionaireTemperatureCardProps {
  warehouseName: string;
  deviceSerialNumber: string;
  temperature: number;
  unit: string;
  lastUpdate: number; // unix ms timestamp
}

const getTemperatureStatus = (temp: number): "green" | "orange" | "red" => {
  if (temp <= -20) return "green";
  if (temp <= -11) return "orange";
  return "red";
};

const statusDotClass = {
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

const statusTempClass = {
  green: "text-green-600 dark:text-green-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
};

export function ConcessionaireTemperatureCard({
  warehouseName,
  deviceSerialNumber,
  temperature,
  unit,
  lastUpdate,
}: ConcessionaireTemperatureCardProps) {
  const status = getTemperatureStatus(temperature);
  const updatedAgo = formatDistanceToNowStrict(new Date(lastUpdate), { addSuffix: true });

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", statusDotClass[status])} />
            <h3 className="font-semibold">{warehouseName}</h3>
          </div>
          <p className="text-muted-foreground text-xs">{deviceSerialNumber}</p>
        </div>
        <div className="text-right">
          <div className={cn("text-3xl font-bold", statusTempClass[status])}>
            {temperature}°{unit}
          </div>
          <p className="text-muted-foreground text-xs">Updated {updatedAgo}</p>
        </div>
      </div>
    </div>
  );
}
