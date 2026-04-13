import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deviceConfigService } from "../services/device-config.service";

import { deviceKeys } from "./use-devices";

export function useConnectGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deviceConfigService.connectGateway(id),
    onSuccess: () => {
      toast.success("Gateway connection initiated successfully");
      void queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message ?? "Failed to connect gateway";
      toast.error(message);
    },
  });
}
