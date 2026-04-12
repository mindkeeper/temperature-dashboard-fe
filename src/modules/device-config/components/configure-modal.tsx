import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useConfigureSensor } from "../hooks/use-configure-sensor";
import { useJobStatus } from "../hooks/use-job-status";
import type { ConfigureFormValues, DeviceListItem } from "../types/device-config.types";
import { configureFormSchema } from "../types/device-config.types";

import { JobStatusIndicator } from "./job-status-indicator";

interface ConfigureModalProps {
  device: DeviceListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigureModal({ device, open, onOpenChange }: ConfigureModalProps) {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const configureMutation = useConfigureSensor();
  const { data: jobStatus } = useJobStatus(activeJobId);

  const form = useForm<ConfigureFormValues>({
    resolver: zodResolver(configureFormSchema),
    defaultValues: {
      interval: 60,
      temperatureOffset: 0,
    },
  });

  // Handle job status resolution
  useEffect(() => {
    if (!jobStatus || !activeJobId) return;

    if (jobStatus.status === "SUCCESS") {
      toast.success("Configuration applied successfully!");
      handleClose();
    } else if (jobStatus.status === "FAILED") {
      toast.error("Gateway rejected configuration.");
      setActiveJobId(null);
    } else if (jobStatus.status === "FAILED_TIMEOUT") {
      toast.error("Configuration timed out. The gateway did not respond within 60 seconds.");
      setActiveJobId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus?.status]);

  function handleClose() {
    setActiveJobId(null);
    configureMutation.reset();
    form.reset();
    onOpenChange(false);
  }

  function onSubmit(values: ConfigureFormValues) {
    if (!device) return;

    configureMutation.mutate(
      {
        sensorId: device.id,
        body: {
          gatewayId: device.id,
          payload: values,
        },
      },
      {
        onSuccess: (data) => {
          setActiveJobId(data.jobId);
        },
        onError: () => {
          toast.error("Failed to send configuration. Please try again.");
        },
      }
    );
  }

  const isPolling = !!activeJobId && jobStatus?.status === "PENDING";
  const isSubmitting = configureMutation.isPending;
  const isBusy = isSubmitting || isPolling;

  return (
    <Dialog open={open} onOpenChange={isBusy ? undefined : onOpenChange}>
      <DialogContent showCloseButton={!isBusy} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Sensor</DialogTitle>
          <DialogDescription>
            {device
              ? `Sending remote configuration to ${device.serialNumber}`
              : "Configure the sensor parameters"}
          </DialogDescription>
        </DialogHeader>

        {/* Job Status Indicator */}
        {activeJobId && jobStatus && <JobStatusIndicator status={jobStatus.status} />}

        {/* Submitting state (before jobId) */}
        {isSubmitting && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-blue-500">
              Sending configuration to gateway...
            </span>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting Interval</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      disabled={isBusy}
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    How often the sensor reports data, in seconds (1–3600)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperatureOffset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature Offset</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      disabled={isBusy}
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>Calibration offset in °C (-10 to +10)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy}>
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPolling ? "Waiting for acknowledgement..." : "Apply Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
