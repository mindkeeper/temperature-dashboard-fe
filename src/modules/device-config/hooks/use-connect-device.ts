import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { deviceConfigService } from "../services/device-config.service";

import { deviceKeys } from "./use-devices";

export function useConnectDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deviceConfigService.connectDevice(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success("Handshake initiated. Awaiting connection from hardware.");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const message = error.response?.data?.message ?? "Failed to initiate handshake";
      toast.error(message);
    },
  });
}
