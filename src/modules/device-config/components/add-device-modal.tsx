import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Loader2,
  Plus,
  CalendarIcon,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ConcessionaireSelect } from "@/modules/dashboard/components/concessionaire-select";
import { useConcessionaire } from "@/modules/dashboard/hooks/use-concessionaire";
import type { Warehouse } from "@/services/concessionaire";

import { useAddDevice } from "../hooks/use-add-device";
import { useCreateGateway } from "../hooks/use-create-gateway";

const gatewaySchema = z.object({
  imei: z.string().min(1, "Gateway IMEI is required"),
  concessionaireId: z.string().min(1, "Concessionaire is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
});

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

type GatewayFormValues = z.infer<typeof gatewaySchema>;
type SensorFormValues = z.infer<typeof sensorSchema>;

export function AddDeviceModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [createdGatewayId, setCreatedGatewayId] = useState<string | null>(null);

  const createGatewayMutation = useCreateGateway();
  const addSensorMutation = useAddDevice();

  const gatewayForm = useForm<GatewayFormValues>({
    resolver: zodResolver(gatewaySchema),
    defaultValues: {
      imei: "",
      concessionaireId: "",
      warehouseId: "",
    },
  });

  const sensorForm = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      serialNumber: "",
      modelname: "",
      specifications: [],
      installedAt: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: sensorForm.control,
    name: "specifications",
  });

  // Reset when modal is closed
  useEffect(() => {
    if (!open) {
      setStep(1);
      setCreatedGatewayId(null);
      gatewayForm.reset();
      sensorForm.reset();
    }
  }, [open, gatewayForm, sensorForm]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedConcessionaireId = gatewayForm.watch("concessionaireId");
  const { data: concessionaireData, isLoading: isLoadingWarehouses } =
    useConcessionaire(selectedConcessionaireId);

  const warehouses = useMemo(() => {
    return concessionaireData?.warehouses ?? [];
  }, [concessionaireData]);

  function onCreateGateway(values: GatewayFormValues) {
    createGatewayMutation.mutate(
      { imei: values.imei, warehouseId: values.warehouseId },
      {
        onSuccess: (data) => {
          setCreatedGatewayId(data.id);
          setStep(2);
          toast.success("Gateway registered! Now add sensors.");
        },
      }
    );
  }

  function onAddSensor(values: SensorFormValues) {
    if (!createdGatewayId) return;

    const specificationsArray: Record<string, string> = {};
    values.specifications.forEach((spec) => {
      specificationsArray[spec.key] = spec.value;
    });

    addSensorMutation.mutate(
      {
        serialNumber: values.serialNumber,
        modelname: values.modelname ?? undefined,
        specifications: specificationsArray,
        installedAt: values.installedAt.toISOString(),
        warehouseId: gatewayForm.getValues("warehouseId"),
        gatewayId: createdGatewayId,
      },
      {
        onSuccess: () => {
          toast.success("Sensor added successfully");
          setCreatedGatewayId(null);
          setStep(1);
          setOpen(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Device
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[500px]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {step === 1 ? "Step 1: Provision Gateway" : "Step 2: Add Sensors"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Register the physical gateway hardware first."
              : "Register sensors connected to your provisioned gateway."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 px-6 py-2">
          <div
            className={cn("h-1.5 flex-1 rounded-full", step >= 1 ? "bg-indigo-600" : "bg-muted")}
          />
          <div
            className={cn("h-1.5 flex-1 rounded-full", step >= 2 ? "bg-indigo-600" : "bg-muted")}
          />
        </div>

        {step === 1 ? (
          <Form {...gatewayForm}>
            <form
              onSubmit={(e) => {
                void gatewayForm.handleSubmit(onCreateGateway)(e);
              }}
              className="flex flex-col overflow-hidden"
            >
              <ScrollArea className="px-6">
                <div className="space-y-4 py-4 pr-3">
                  <FormField
                    control={gatewayForm.control}
                    name="imei"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gateway IMEI</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 15-digit IMEI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={gatewayForm.control}
                      name="concessionaireId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concessionaire</FormLabel>
                          <ConcessionaireSelect
                            value={field.value}
                            onValueChange={(id) => {
                              field.onChange(id);
                              gatewayForm.setValue("warehouseId", "");
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={gatewayForm.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warehouse</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedConcessionaireId || isLoadingWarehouses}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select warehouse" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warehouses.map((w: Warehouse) => (
                                <SelectItem key={w.id} value={w.id}>
                                  {w.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                <Button type="submit" disabled={createGatewayMutation.isPending} className="gap-2">
                  {createGatewayMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Next: Add Sensors
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...sensorForm}>
            <form
              onSubmit={(e) => {
                void sensorForm.handleSubmit(onAddSensor)(e);
              }}
              className="flex flex-col overflow-hidden"
            >
              <ScrollArea className="px-6">
                <div className="space-y-4 py-4 pr-3">
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-900">Gateway Ready</p>
                      <p className="text-[10px] text-emerald-700">
                        IMEI: {gatewayForm.getValues("imei")}
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={sensorForm.control}
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
                    control={sensorForm.control}
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
                            control={sensorForm.control}
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
                            control={sensorForm.control}
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
                    control={sensorForm.control}
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
                  variant="ghost"
                  onClick={() => {
                    setStep(1);
                  }}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex-1" />
                <Button type="submit" disabled={addSensorMutation.isPending} className="gap-2">
                  {addSensorMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Register Sensor
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
