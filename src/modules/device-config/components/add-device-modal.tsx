import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, Plus, CalendarIcon, Trash2 } from "lucide-react";
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
  FormDescription,
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

const addDeviceSchema = z.object({
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
  concessionaireId: z.string().min(1, "Concessionaire is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
});

type AddDeviceFormValues = z.infer<typeof addDeviceSchema>;

export function AddDeviceModal() {
  const [open, setOpen] = useState(false);
  const addDeviceMutation = useAddDevice();

  const form = useForm<AddDeviceFormValues>({
    resolver: zodResolver(addDeviceSchema),
    defaultValues: {
      serialNumber: "",
      modelname: "",
      specifications: [],
      installedAt: new Date(),
      concessionaireId: "",
      warehouseId: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      form.reset({
        serialNumber: "",
        modelname: "",
        specifications: [],
        installedAt: new Date(),
        concessionaireId: "",
        warehouseId: "",
      });
    }
  }, [open, form]);

  const selectedConcessionaireId = form.watch("concessionaireId");

  // Fetch concessionaire details to get its warehouses
  const { data: concessionaireData, isLoading: isLoadingWarehouses } =
    useConcessionaire(selectedConcessionaireId);

  const warehouses = useMemo(() => {
    return concessionaireData?.warehouses ?? [];
  }, [concessionaireData]);

  function onSubmit(values: AddDeviceFormValues) {
    const specificationsArray: Record<string, string> = {};
    values.specifications.forEach((spec) => {
      specificationsArray[spec.key] = spec.value;
    });

    addDeviceMutation.mutate(
      {
        serialNumber: values.serialNumber,
        modelname: values.modelname ?? undefined,
        specifications:
          Object.keys(specificationsArray).length > 0 ? specificationsArray : undefined,
        installedAt: values.installedAt.toISOString(),
        warehouseId: values.warehouseId,
      },
      {
        onSuccess: () => {
          toast.success("Device registered successfully");
          setOpen(false);
          form.reset();
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
          const message = error.response?.data?.message ?? "Failed to register device";
          toast.error(message);
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
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>
            Enter the details of the new sensor or gateway to register it in the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col overflow-hidden"
          >
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 py-4 pr-3">
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SN-JAKARTA-001" {...field} />
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
                        <Input placeholder="e.g. Teltonika RUT240" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm leading-none font-medium">Additional Specifications</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        append({ key: "", value: "" });
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.length === 0 && (
                      <p className="text-muted-foreground py-2 text-center text-xs">
                        No custom specifications added yet.
                      </p>
                    )}
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        {}
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.key` as const}
                          render={({ field: fieldProps }) => (
                            <FormItem className="flex-1 space-y-1">
                              <FormControl>
                                <Input
                                  placeholder="Key (e.g. Manufacturer)"
                                  className="h-8 text-xs font-medium"
                                  {...fieldProps}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        {}
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.value` as const}
                          render={({ field: fieldProps }) => (
                            <FormItem className="flex-[1.5] space-y-1">
                              <FormControl>
                                <Input
                                  placeholder="Value"
                                  className="h-8 text-xs"
                                  {...fieldProps}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
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
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
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
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                typeof field.value === "object" && "text-muted-foreground"
                              )}
                            >
                              {typeof field.value === "object" ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <FormField
                      control={form.control}
                      name="concessionaireId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Concessionaire</FormLabel>
                          <ConcessionaireSelect
                            value={field.value}
                            onValueChange={(id) => {
                              field.onChange(id);
                              form.setValue("warehouseId", ""); // Reset warehouse on concessionaire change
                            }}
                            className="w-full overflow-hidden"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="min-w-0">
                    <FormField
                      control={form.control}
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
                              <SelectTrigger className="w-full overflow-hidden">
                                <SelectValue placeholder="Select warehouse" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warehouses.map((warehouse: Warehouse) => (
                                <SelectItem key={warehouse.id} value={warehouse.id}>
                                  {warehouse.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {!selectedConcessionaireId && "Select a concessionaire first"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="bg-background sticky bottom-0 border-t p-6 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
                disabled={addDeviceMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addDeviceMutation.isPending}>
                {addDeviceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Device
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
