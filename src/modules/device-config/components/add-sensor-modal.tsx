import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, Plus, CalendarIcon, Trash2, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useAddDevice } from "../hooks/use-add-device";

const sensorSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  modelname: z.string().optional(),
  specifications: z.array(
    z.object({
      key: z.string().min(1, "Key is required"),
      value: z.string().min(1, "Value is required"),
    })
  ),
  installedAt: z.date({
    message: "Installation date is required",
  }),
});

type SensorFormValues = z.infer<typeof sensorSchema>;

interface AddSensorModalProps {
  gatewayId: string;
  gatewayImei: string;
  warehouseId: string;
}

export function AddSensorModal({ gatewayId, gatewayImei, warehouseId }: AddSensorModalProps) {
  const [open, setOpen] = useState(false);
  const addSensorMutation = useAddDevice();

  const form = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      serialNumber: "",
      modelname: "",
      specifications: [],
      installedAt: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: SensorFormValues) {
    const specificationsObj: Record<string, string> = {};
    values.specifications.forEach((spec) => {
      specificationsObj[spec.key] = spec.value;
    });

    addSensorMutation.mutate(
      {
        serialNumber: values.serialNumber,
        modelname: values.modelname ?? undefined,
        specifications: specificationsObj,
        installedAt: values.installedAt.toISOString(),
        warehouseId,
        gatewayId,
      },
      {
        onSuccess: () => {
          toast.success("Sensor added successfully");
          setOpen(false);
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
          const message = error.response?.data?.message ?? "Failed to add sensor";
          toast.error(message);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Sensor
          </Button>
        }
      />

      <DialogContent
        className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[500px]"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Add Sensor</DialogTitle>
          <DialogDescription>Register a new sensor to this gateway.</DialogDescription>
        </DialogHeader>

        <div className="mx-6 flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
          <Cpu className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-xs font-semibold text-indigo-900">Gateway</p>
            <p className="text-[10px] text-indigo-700">IMEI: {gatewayImei}</p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col overflow-hidden"
          >
            <ScrollArea className="px-6">
              <div className="space-y-4 py-4 pr-3">
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sensor Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SN-TEMP-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TempProbe Pro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm leading-none font-medium">Specifications</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        append({ key: "", value: "" });
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Field
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.key` as const}
                          render={({ field: p }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Key"
                                  className="h-8 text-xs font-medium"
                                  {...p}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.value` as const}
                          render={({ field: p }) => (
                            <FormItem className="flex-[1.5]">
                              <FormControl>
                                <Input placeholder="Value" className="h-8 text-xs" {...p} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            remove(index);
                          }}
                          className="text-destructive h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="installedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Installation Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                "text-muted-foreground"
                              )}
                            >
                              {format(field.value, "PPP")}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="border-t p-6 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addSensorMutation.isPending} className="gap-2">
                {addSensorMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Register Sensor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
