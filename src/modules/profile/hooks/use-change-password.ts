import { useMutation } from "@tanstack/react-query";

import { profileService } from "../services/profile.service";
import type { ChangePasswordPayload } from "../types/profile.types";

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => profileService.changePassword(data),
  });
}
