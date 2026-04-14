import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useConcessionaires } from "../hooks/use-concessionaires";
import { useCreateConcessionaire } from "../hooks/use-create-concessionaire";

import { ConcessionaireFormModal } from "./concessionaire-form-modal";
import { ConcessionaireTable } from "./concessionaire-table";

export function ConcessionaireListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading, isError, error } = useConcessionaires({
    page,
    limit: 10,
    q: debouncedSearch || undefined,
  });

  const createConcessionaire = useCreateConcessionaire();

  const concessionaires = data?.data ?? [];
  const pagination = data?.meta.pagination;

  function handleFormSubmit(formData: {
    name: string;
    slug: string;
    address: string;
    latitude: string;
    longitude: string;
  }) {
    createConcessionaire.mutate(
      {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      },
      {
        onSuccess: () => {
          toast.success("Concessionaire created successfully");
          setIsFormOpen(false);
        },
        onError: () => {
          toast.error("Failed to create concessionaire");
        },
      }
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
            <h1 className="text-2xl font-bold tracking-tight">Concessionaires</h1>
            <p className="text-muted-foreground text-sm">
              Manage concessionaires and their warehouses
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Concessionaires</CardTitle>
              <CardDescription>
                {pagination
                  ? `Showing ${String(concessionaires.length)} of ${String(pagination.total)} concessionaires`
                  : "Loading concessionaires..."}
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={() => {
                  setIsFormOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Concessionaire
              </Button>
              <div className="bg-border mx-1 hidden h-8 w-px sm:block" />
              <div className="relative w-full sm:w-64">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  placeholder="Search concessionaires..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12">
              <TriangleAlert className="mb-3 h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-700">Failed to load concessionaires</p>
              <p className="mt-1 text-xs text-red-600">
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <ConcessionaireTable concessionaires={concessionaires} />

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => {
                        setPage((p) => p + 1);
                      }}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConcessionaireFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={createConcessionaire.isPending}
      />
    </div>
  );
}
