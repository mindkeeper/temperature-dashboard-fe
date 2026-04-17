import { useQuery } from "@tanstack/react-query";

import { breachLogService, type BreachLogParams } from "@/services/breach-log";

export const breachLogKeys = {
  all: ["breach-log"] as const,
  list: (params: BreachLogParams) => [...breachLogKeys.all, params] as const,
};

export const useBreachLog = (params: BreachLogParams) => {
  return useQuery({
    queryKey: breachLogKeys.list(params),
    queryFn: () => breachLogService.getBreachLog(params),
    placeholderData: (prev) => prev,
  });
};
