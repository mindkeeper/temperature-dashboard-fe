import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateUser } from "../hooks/use-create-user";
import { useDeleteUser } from "../hooks/use-delete-user";
import { useUpdateUser } from "../hooks/use-update-user";
import { useUsers } from "../hooks/use-users";
import type { User } from "../types/user-management.types";

import { DeleteUserDialog } from "./delete-user-dialog";
import { UserFormModal } from "./user-form-modal";
import { UserTable } from "./user-table";

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data, isLoading, isError, error } = useUsers({
    page,
    limit: 10,
    q: debouncedSearch || undefined,
    role:
      roleFilter !== "all"
        ? (roleFilter as "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN")
        : undefined,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = data?.data ?? [];
  const pagination = data?.meta.pagination;

  function handleEdit(user: User) {
    setEditingUser(user);
    setIsFormOpen(true);
  }

  function handleDelete(user: User) {
    setDeletingUser(user);
  }

  function handleFormSubmit(formData: {
    email: string;
    name?: string;
    role: "CONCESSIONAIRE" | "HEADOFFICE" | "SUPERADMIN";
    concessionaireId?: string;
  }) {
    const { concessionaireId, ...rest } = formData;
    const payload = {
      ...rest,
      name: formData.name ?? undefined,
      ...(concessionaireId ? { concessionaireId } : {}),
    };

    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, data: payload },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            setIsFormOpen(false);
            setEditingUser(null);
          },
          onError: () => {
            toast.error("Failed to update user");
          },
        }
      );
    } else {
      createUser.mutate(payload, {
        onSuccess: () => {
          toast.success("User created successfully");
          setIsFormOpen(false);
        },
        onError: () => {
          toast.error("Failed to create user");
        },
      });
    }
  }

  function handleDeleteConfirm() {
    if (!deletingUser) return;
    deleteUser.mutate(deletingUser.id, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setDeletingUser(null);
      },
      onError: () => {
        toast.error("Failed to delete user");
      },
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground text-sm">
              Manage user accounts and role assignments
            </p>
          </div>
        </div>
      </div>

      {/* User Table Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Users</CardTitle>
              <CardDescription>
                {pagination
                  ? `Showing ${String(users.length)} of ${String(pagination.total)} users`
                  : "Loading users..."}
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={() => {
                  setEditingUser(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
              <div className="bg-border mx-1 hidden h-8 w-px sm:block" />

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    placeholder="Search name or email..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="CONCESSIONAIRE">Concessionaire</SelectItem>
                    <SelectItem value="HEADOFFICE">Head Office</SelectItem>
                    <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12">
              <TriangleAlert className="mb-3 h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-700">Failed to load users</p>
              <p className="mt-1 text-xs text-red-600">
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => {
                        setPage((p) => p + 1);
                      }}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <UserFormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={handleFormSubmit}
        isLoading={createUser.isPending || updateUser.isPending}
      />

      {/* Delete Dialog */}
      <DeleteUserDialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
        user={deletingUser}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
