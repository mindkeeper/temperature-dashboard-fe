import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userManagementService } from "../services/user-management.service";

import { userKeys } from "./use-users";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userManagementService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
