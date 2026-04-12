import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ConfigurationJobStatus } from "../types/device-config.types";

interface JobStatusIndicatorProps {
  status: ConfigurationJobStatus;
  className?: string;
}

const statusConfig: Record<
  ConfigurationJobStatus,
  { icon: typeof Loader2; label: string; colorClass: string }
> = {
  PENDING: {
    icon: Loader2,
    label: "Applying configuration...",
    colorClass: "text-blue-500",
  },
  SUCCESS: {
    icon: CheckCircle2,
    label: "Configuration applied successfully!",
    colorClass: "text-emerald-500",
  },
  FAILED: {
    icon: XCircle,
    label: "Gateway rejected configuration.",
    colorClass: "text-red-500",
  },
  FAILED_TIMEOUT: {
    icon: Clock,
    label: "Configuration timed out. The gateway did not respond within 60 seconds.",
    colorClass: "text-amber-500",
  },
};

export function JobStatusIndicator({ status, className }: JobStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isPending = status === "PENDING";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3",
        isPending ? "border-blue-200 bg-blue-50" : "",
        status === "SUCCESS" ? "border-emerald-200 bg-emerald-50" : "",
        status === "FAILED" ? "border-red-200 bg-red-50" : "",
        status === "FAILED_TIMEOUT" ? "border-amber-200 bg-amber-50" : "",
        className
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", config.colorClass, isPending && "animate-spin")} />
      <span className={cn("text-sm font-medium", config.colorClass)}>{config.label}</span>
    </div>
  );
}
