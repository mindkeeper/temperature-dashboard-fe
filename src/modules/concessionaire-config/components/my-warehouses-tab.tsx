import { Pencil } from "lucide-react";
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
import { WarehouseFormModal } from "@/modules/concessionaire-management/components/warehouse-form-modal";

import { useUpdateMyWarehouse } from "../hooks/use-update-my-warehouse";
import type { Concessionaire, Warehouse } from "../types/concessionaire-config.types";

interface MyWarehousesTabProps {
  concessionaire: Concessionaire;
}

export function MyWarehousesTab({ concessionaire }: MyWarehousesTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const updateMyWarehouse = useUpdateMyWarehouse();

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
    if (!editingWarehouse) return;

    const latitude = formData.latitude ? parseFloat(formData.latitude) : null;
    const longitude = formData.longitude ? parseFloat(formData.longitude) : null;

    updateMyWarehouse.mutate(
      {
        id: editingWarehouse.id,
        data: { name: formData.name, address: formData.address, latitude, longitude },
      },
      {
        onSuccess: () => {
          toast.success("Warehouse updated successfully");
          setIsFormOpen(false);
          setEditingWarehouse(null);
        },
        onError: () => toast.error("Failed to update warehouse"),
      }
    );
  }

  return (
    <div className="space-y-4">
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
        isLoading={updateMyWarehouse.isPending}
      />
    </div>
  );
}
