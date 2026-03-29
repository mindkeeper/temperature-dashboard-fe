import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { concessionaireService, type GetAllConcessionairesParams } from "@/services/concessionaire";

export const concessionarieKeys = {
  all: ["concessionaires"] as const,
  lists: () => [...concessionarieKeys.all, "list"] as const,
  list: (filters: string) => [...concessionarieKeys.lists(), filters] as const,
  details: (id: string) => [...concessionarieKeys.all, id] as const,
};

export const useAllConcessionaires = (params?: GetAllConcessionairesParams) => {
  return useQuery({
    queryKey: [...concessionarieKeys.lists(), params],
    queryFn: () => concessionaireService.getAllConcessionaires(params),
  });
};

export const useConcessionaire = (id: string) => {
  return useQuery({
    queryKey: concessionarieKeys.details(id),
    queryFn: () => concessionaireService.getConcessionaireById(id),
    enabled: !!id,
  });
};

export const useConcessionaireInfinite = (search: string) => {
  return useInfiniteQuery({
    queryKey: [...concessionarieKeys.all, "infinite", search] as const,
    queryFn: ({ pageParam }) =>
      concessionaireService.getAllConcessionaires({
        q: search || undefined,
        page: pageParam,
        limit: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
};
