import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { Warehouse } from "../types/concessionaire-management.types";

const warehouseFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  address: z.string().min(1, "Address is required").max(500),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

interface WarehouseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
  onSubmit: (data: WarehouseFormValues) => void;
  isLoading?: boolean;
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function WarehouseFormModal({
  open,
  onOpenChange,
  warehouse,
  onSubmit,
  isLoading,
}: WarehouseFormModalProps) {
  const isEditing = !!warehouse;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<WarehouseFormValues, any, WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      address: "",
    },
  });

  const watchedName = useWatch({ control: form.control, name: "name" });

  useEffect(() => {
    if (!isEditing) {
      form.setValue("slug", toSlug(watchedName));
    }
  }, [watchedName, form, isEditing]);

  useEffect(() => {
    if (open && warehouse) {
      form.reset({
        name: warehouse.name,
        slug: warehouse.slug,
        address: warehouse.address,
        latitude: String(warehouse.latitude),
        longitude: String(warehouse.longitude),
      });
    } else if (open) {
      form.reset({ name: "", slug: "", address: "" });
    }
  }, [open, warehouse, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update warehouse information."
              : "Add a new warehouse to this concessionaire."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Warehouse Jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="warehouse-jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Jl. Gatot Subroto No. 456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="-6.2088" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="106.8456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Add Warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
