import { useQuery } from "@tanstack/react-query";

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
