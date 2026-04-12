import { useQuery } from "@tanstack/react-query";

import { deviceConfigService } from "../services/device-config.service";
import type { GetDevicesParams } from "../types/device-config.types";

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (filters: GetDevicesParams) => [...deviceKeys.lists(), filters] as const,
};

export function useDevices(params: GetDevicesParams = {}) {
  return useQuery({
    queryKey: deviceKeys.list(params),
    queryFn: () => deviceConfigService.getDevices(params),
    refetchInterval: (query) => {
      // Check if any device in the current list is awaiting connection
      const hasAwaiting = query.state.data?.data.some(
        (device) => device.provisionStatus === "READY_FOR_PROVISIONING"
      );
      // If found, poll every 5 seconds; otherwise, stop polling
      return hasAwaiting ? 5000 : false;
    },
  });
}
