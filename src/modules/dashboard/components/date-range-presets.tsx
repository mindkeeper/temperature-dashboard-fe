import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PresetKey = "24h" | "7d" | "30d" | "custom";

interface DateRangePresetsProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const presets: { key: PresetKey; label: string; getRange: () => { start: Date; end: Date } }[] = [
  {
    key: "24h",
    label: "24h",
    getRange: () => ({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    key: "7d",
    label: "7d",
    getRange: () => ({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    key: "30d",
    label: "30d",
    getRange: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
];

export function DateRangePresets({ startDate, endDate, onDateRangeChange }: DateRangePresetsProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>("30d");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });

  const handlePresetClick = (preset: (typeof presets)[number]) => {
    setActivePreset(preset.key);
    const range = preset.getRange();
    onDateRangeChange(range.start, range.end);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setPendingRange(range);
  };

  const handleOk = () => {
    if (pendingRange?.from && pendingRange.to) {
      setActivePreset("custom");
      onDateRangeChange(pendingRange.from, pendingRange.to);
      setCalendarOpen(false);
    }
  };

  const handleReset = () => {
    setPendingRange({ from: startDate, to: endDate });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setPendingRange({ from: startDate, to: endDate });
    }
    setCalendarOpen(open);
  };

  return (
    <div className="flex items-center gap-1">
      {presets.map((preset) => (
        <Button
          key={preset.key}
          variant={activePreset === preset.key ? "default" : "outline"}
          size="sm"
          onClick={() => {
            handlePresetClick(preset);
          }}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant={activePreset === "custom" ? "default" : "outline"} size="sm">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {activePreset === "custom"
              ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
              : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={pendingRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
          <div className="flex items-center justify-end gap-2 border-t p-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleOk}
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              disabled={!pendingRange?.from || !pendingRange?.to}
            >
              OK
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
