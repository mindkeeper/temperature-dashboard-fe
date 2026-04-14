import { useQuery } from "@tanstack/react-query";

import { userManagementService } from "../services/user-management.service";
import type { GetUsersParams } from "../types/user-management.types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userManagementService.getUsers(params),
  });
}
