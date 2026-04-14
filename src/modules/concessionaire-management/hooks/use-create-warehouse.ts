import { useMutation, useQueryClient } from "@tanstack/react-query";

import { concessionaireManagementService } from "../services/concessionaire-management.service";
import type { CreateWarehousePayload } from "../types/concessionaire-management.types";

import { concessionaireKeys } from "./use-concessionaires";

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWarehousePayload) =>
      concessionaireManagementService.createWarehouse(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: concessionaireKeys.detail(variables.concessionaireId),
      });
    },
  });
}
