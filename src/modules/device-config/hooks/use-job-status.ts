import { useQuery } from "@tanstack/react-query";

import { deviceConfigService } from "../services/device-config.service";

export const jobKeys = {
  all: ["jobs"] as const,
  statuses: () => [...jobKeys.all, "status"] as const,
  status: (jobId: string) => [...jobKeys.statuses(), jobId] as const,
};

/**
 * Polls the job status endpoint every 3 seconds while the job is PENDING.
 * Stops polling automatically when the status resolves to SUCCESS, FAILED, or FAILED_TIMEOUT.
 */
export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: jobKeys.status(jobId ?? ""),
    queryFn: () => deviceConfigService.getJobStatus(jobId ?? ""),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Keep polling every 3s while PENDING, stop when resolved
      return status === "PENDING" ? 3000 : false;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}
