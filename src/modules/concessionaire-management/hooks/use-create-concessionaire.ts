import { useMutation, useQueryClient } from "@tanstack/react-query";

import { concessionaireManagementService } from "../services/concessionaire-management.service";
import type { CreateConcessionairePayload } from "../types/concessionaire-management.types";

import { concessionaireKeys } from "./use-concessionaires";

export function useCreateConcessionaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConcessionairePayload) =>
      concessionaireManagementService.createConcessionaire(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: concessionaireKeys.lists(),
      });
    },
  });
}
