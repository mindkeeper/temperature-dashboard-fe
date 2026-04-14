import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useCreateWarehouse } from "../hooks/use-create-warehouse";
import { useUpdateWarehouse } from "../hooks/use-update-warehouse";
import type { Concessionaire, Warehouse } from "../types/concessionaire-management.types";

import { WarehouseFormModal } from "./warehouse-form-modal";

interface WarehousesTabProps {
  concessionaire: Concessionaire;
}

export function WarehousesTab({ concessionaire }: WarehousesTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse(concessionaire.id);

  const warehouses = concessionaire.warehouses;

  function handleEdit(warehouse: Warehouse) {
    setEditingWarehouse(warehouse);
    setIsFormOpen(true);
  }

  function handleFormSubmit(formData: {
    name: string;
    slug: string;
    address: string;
    latitude?: string;
    longitude?: string;
  }) {
    const latitude = formData.latitude ? parseFloat(formData.latitude) : null;
    const longitude = formData.longitude ? parseFloat(formData.longitude) : null;

    if (editingWarehouse) {
      updateWarehouse.mutate(
        {
          id: editingWarehouse.id,
          data: {
            name: formData.name,
            address: formData.address,
            latitude,
            longitude,
          },
        },
        {
          onSuccess: () => {
            toast.success("Warehouse updated successfully");
            setIsFormOpen(false);
            setEditingWarehouse(null);
          },
          onError: () => {
            toast.error("Failed to update warehouse");
          },
        }
      );
    } else {
      createWarehouse.mutate(
        {
          name: formData.name,
          slug: formData.slug,
          address: formData.address,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          concessionaireId: concessionaire.id,
        },
        {
          onSuccess: () => {
            toast.success("Warehouse created successfully");
            setIsFormOpen(false);
          },
          onError: () => {
            toast.error("Failed to create warehouse");
          },
        }
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingWarehouse(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      {warehouses.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">No warehouses found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{warehouse.slug}</TableCell>
                <TableCell>{warehouse.address}</TableCell>
                <TableCell>{warehouse.devices.length}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      handleEdit(warehouse);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <WarehouseFormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingWarehouse(null);
        }}
        warehouse={editingWarehouse}
        onSubmit={handleFormSubmit}
        isLoading={createWarehouse.isPending || updateWarehouse.isPending}
      />
    </div>
  );
}
