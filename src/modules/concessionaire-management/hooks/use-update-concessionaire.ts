import { useMutation, useQueryClient } from "@tanstack/react-query";

import { concessionaireManagementService } from "../services/concessionaire-management.service";
import type { UpdateConcessionairePayload } from "../types/concessionaire-management.types";

import { concessionaireKeys } from "./use-concessionaires";

export function useUpdateConcessionaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConcessionairePayload }) =>
      concessionaireManagementService.updateConcessionaire(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: concessionaireKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: concessionaireKeys.detail(variables.id),
      });
    },
  });
}
