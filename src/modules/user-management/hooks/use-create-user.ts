import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userManagementService } from "../services/user-management.service";
import type { CreateUserPayload } from "../types/user-management.types";

import { userKeys } from "./use-users";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => userManagementService.createUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
