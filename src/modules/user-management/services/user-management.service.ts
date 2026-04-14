import { apiClient } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/responses";

import type {
  CreateUserPayload,
  GetUsersParams,
  UpdateUserPayload,
  User,
} from "../types/user-management.types";

export const userManagementService = {
  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>("/users", {
      params,
    });
    return response.data;
  },

  async getUserById(id: string): Promise<ApiResponse<{ data: User }>> {
    const response = await apiClient.get<ApiResponse<{ data: User }>>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserPayload): Promise<ApiResponse<{ data: User }>> {
    const response = await apiClient.post<ApiResponse<{ data: User }>>("/users", data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserPayload): Promise<ApiResponse<{ data: User }>> {
    const response = await apiClient.patch<ApiResponse<{ data: User }>>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<ApiResponse<{ data: User }>> {
    const response = await apiClient.delete<ApiResponse<{ data: User }>>(`/users/${id}`);
    return response.data;
  },
};
