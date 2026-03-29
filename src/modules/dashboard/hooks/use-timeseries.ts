import { useQuery } from "@tanstack/react-query";

import { statsService, type GetTimeseriesParams } from "@/services/stats";

export const timeseriesKeys = {
  all: ["timeseries"] as const,
  list: (params: GetTimeseriesParams) => [...timeseriesKeys.all, params] as const,
};

export const useTimeseries = (params: GetTimeseriesParams | null) => {
  return useQuery({
    queryKey: timeseriesKeys.list(params ?? { concessId: "" }),
    queryFn: () => statsService.getTimeseries(params ?? { concessId: "" }),
    enabled: !!params?.concessId,
    select: (data) => data.data,
  });
};
