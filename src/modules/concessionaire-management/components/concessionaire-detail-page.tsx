import { ArrowLeft, Building2, Loader2, TriangleAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useConcessionaireDetail } from "../hooks/use-concessionaires";

import { ConcessionaireDetailsTab } from "./concessionaire-details-tab";
import { WarehousesTab } from "./warehouses-tab";

export function ConcessionaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useConcessionaireDetail(id ?? "");

  const concessionaire = data as
    | (import("../types/concessionaire-management.types").Concessionaire & { message: string })
    | undefined;

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
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void navigate("/concessionaires")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          onClick={() => void navigate("/concessionaires")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Concessionaires
        </Button>
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
          <ConcessionaireDetailsTab concessionaire={concessionaire} />
        </TabsContent>
        <TabsContent value="warehouses" className="mt-6">
          <WarehousesTab concessionaire={concessionaire} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
