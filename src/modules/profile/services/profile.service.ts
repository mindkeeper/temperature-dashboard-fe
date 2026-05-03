import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/responses";

import type {
  ChangePasswordPayload,
  ProfileUser,
  UpdateProfilePayload,
} from "../types/profile.types";

export const profileService = {
  async updateProfile(data: UpdateProfilePayload): Promise<ApiResponse<ProfileUser>> {
    const response = await apiClient.patch<ApiResponse<ProfileUser>>("/users/me/profile", data);
    return response.data;
  },

  async changePassword(data: ChangePasswordPayload): Promise<void> {
    await apiClient.patch("/users/me/password", data);
  },
};
