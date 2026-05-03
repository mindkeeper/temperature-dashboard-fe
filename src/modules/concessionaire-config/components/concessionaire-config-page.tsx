import { Building2, Loader2, TriangleAlert } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMyConcessionaire } from "../hooks/use-my-concessionaire";
import type { Concessionaire } from "../types/concessionaire-config.types";

import { MyConcessionaireDetailsTab } from "./my-concessionaire-details-tab";
import { MyWarehousesTab } from "./my-warehouses-tab";

export function ConcessionaireConfigPage() {
  const { data, isLoading, isError, error } = useMyConcessionaire();

  const concessionaire = data as (Concessionaire & { message: string }) | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !concessionaire) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12">
          <TriangleAlert className="mb-3 h-10 w-10 text-red-500" />
          <p className="text-sm font-medium text-red-700">Failed to load concessionaire</p>
          <p className="mt-1 text-xs text-red-600">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{concessionaire.name}</h1>
            <p className="text-muted-foreground text-sm">{concessionaire.address}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="warehouses">
            Warehouses ({concessionaire.warehouses.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <MyConcessionaireDetailsTab concessionaire={concessionaire} />
        </TabsContent>
        <TabsContent value="warehouses" className="mt-6">
          <MyWarehousesTab concessionaire={concessionaire} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
