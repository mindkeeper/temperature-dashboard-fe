import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deviceConfigService } from "../services/device-config.service";
import type { CreateDevicePayload } from "../types/device-config.types";

import { deviceKeys } from "./use-devices";

export function useAddDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDevicePayload) => deviceConfigService.createDevice(data),
    onSuccess: () => {
      // Refresh the device list after adding a new one
      void queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}
