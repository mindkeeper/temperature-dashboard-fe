import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userManagementService } from "../services/user-management.service";
import type { UpdateUserPayload } from "../types/user-management.types";

import { userKeys } from "./use-users";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      userManagementService.updateUser(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
