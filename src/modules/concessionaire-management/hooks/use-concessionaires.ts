import { useQuery } from "@tanstack/react-query";

import { concessionaireService, type GetAllConcessionairesParams } from "@/services/concessionaire";

export const concessionaireKeys = {
  all: ["concessionaires"] as const,
  lists: () => [...concessionaireKeys.all, "list"] as const,
  list: (params: GetAllConcessionairesParams) => [...concessionaireKeys.lists(), params] as const,
  details: () => [...concessionaireKeys.all, "detail"] as const,
  detail: (id: string) => [...concessionaireKeys.details(), id] as const,
};

export function useConcessionaires(params: GetAllConcessionairesParams = {}) {
  return useQuery({
    queryKey: concessionaireKeys.list(params),
    queryFn: () => concessionaireService.getAllConcessionaires(params),
  });
}

export function useConcessionaireDetail(id: string) {
  return useQuery({
    queryKey: concessionaireKeys.detail(id),
    queryFn: () => concessionaireService.getConcessionaireById(id),
    enabled: !!id,
  });
}
