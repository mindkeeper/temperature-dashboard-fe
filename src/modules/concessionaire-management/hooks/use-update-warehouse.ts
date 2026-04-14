import { useMutation, useQueryClient } from "@tanstack/react-query";

import { concessionaireManagementService } from "../services/concessionaire-management.service";
import type { UpdateWarehousePayload } from "../types/concessionaire-management.types";

import { concessionaireKeys } from "./use-concessionaires";

export function useUpdateWarehouse(concessionaireId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehousePayload }) =>
      concessionaireManagementService.updateWarehouse(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: concessionaireKeys.detail(concessionaireId),
      });
    },
  });
}
