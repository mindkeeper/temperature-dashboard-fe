import { useMutation, useQueryClient } from "@tanstack/react-query";

import { concessionaireConfigService } from "../services/concessionaire-config.service";
import type { UpdateMyConcessionairePayload } from "../types/concessionaire-config.types";

import { myConcessionaireKeys } from "./use-my-concessionaire";

export function useUpdateMyConcessionaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMyConcessionairePayload) =>
      concessionaireConfigService.updateMyConcessionaire(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: myConcessionaireKeys.detail(),
      });
    },
  });
}
