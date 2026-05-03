import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/modules/auth/store/auth.store";

import { profileService } from "../services/profile.service";
import type { UpdateProfilePayload } from "../types/profile.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => profileService.updateProfile(data),
    onSuccess: (response) => {
      setUser({ name: response.name });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
