import { useQuery } from "@tanstack/react-query";

import { concessionaireConfigService } from "../services/concessionaire-config.service";

export const myConcessionaireKeys = {
  all: ["my-concessionaire"] as const,
  detail: () => [...myConcessionaireKeys.all, "detail"] as const,
};

export function useMyConcessionaire() {
  return useQuery({
    queryKey: myConcessionaireKeys.detail(),
    queryFn: () => concessionaireConfigService.getMyConcessionaire(),
  });
}
