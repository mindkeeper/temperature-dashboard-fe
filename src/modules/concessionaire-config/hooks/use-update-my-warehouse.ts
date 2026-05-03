import { useMutation, useQueryClient } from "@tanstack/react-query";

import { concessionaireConfigService } from "../services/concessionaire-config.service";
import type { UpdateMyWarehousePayload } from "../types/concessionaire-config.types";

import { myConcessionaireKeys } from "./use-my-concessionaire";

export function useUpdateMyWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMyWarehousePayload }) =>
      concessionaireConfigService.updateMyWarehouse(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: myConcessionaireKeys.detail(),
      });
    },
  });
}
