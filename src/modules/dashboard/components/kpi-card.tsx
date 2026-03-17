import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  primaryMetric: string;
  secondaryDetail: string;
  variant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
  isActive?: boolean;
  activeLabel?: string;
}

export function KpiCard({
  title,
  icon: Icon,
  primaryMetric,
  secondaryDetail,
  variant = "default",
  onClick,
  isActive = false,
  activeLabel,
}: KpiCardProps) {
  const variantStyles = {
    default: "text-blue-500",
    success: "text-green-500",
    warning: "text-orange-500",
    danger: "text-red-500",
  };

  const content = (
    <div className="flex flex-col gap-4" data-variant={variant}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", variantStyles[variant])} />
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-bold">{primaryMetric}</p>
        <p className="text-muted-foreground text-sm">{secondaryDetail}</p>
      </div>
      {isActive && activeLabel && (
        <p className="text-xs font-medium text-blue-600">{activeLabel}</p>
      )}
    </div>
  );

  if (onClick) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isActive && "ring-2 ring-blue-500"
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <CardContent className="p-6">{content}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  );
}
