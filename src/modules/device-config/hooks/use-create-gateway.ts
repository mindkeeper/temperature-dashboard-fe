import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deviceConfigService } from "../services/device-config.service";
import type { CreateGatewayPayload } from "../types/device-config.types";

import { deviceKeys } from "./use-devices";

export function useCreateGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGatewayPayload) => deviceConfigService.createGateway(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message ?? "Failed to register gateway";
      toast.error(message);
    },
  });
}
