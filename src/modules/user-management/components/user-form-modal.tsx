import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConcessionaireCombobox } from "@/modules/dashboard/components/concessionaire-combobox";

import type { User } from "../types/user-management.types";

const userFormSchema = z
  .object({
    email: z.email("Invalid email format").max(320),
    name: z.string().max(255).optional().or(z.literal("")),
    role: z.enum(["CONCESSIONAIRE", "HEADOFFICE", "SUPERADMIN"]),
    concessionaireId: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.role === "CONCESSIONAIRE" && !data.concessionaireId) {
        return false;
      }
      return true;
    },
    {
      message: "Concessionaire is required for CONCESSIONAIRE role",
      path: ["concessionaireId"],
    }
  );

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: UserFormValues) => void;
  isLoading?: boolean;
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: UserFormModalProps) {
  const isEditing = !!user;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<UserFormValues, any, UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "CONCESSIONAIRE",
      concessionaireId: "",
    },
  });

  const watchedRole = useWatch({ control: form.control, name: "role" });

  useEffect(() => {
    if (open && user) {
      form.reset({
        email: user.email,
        name: user.name ?? "",
        role: user.role,
        concessionaireId: user.concessionaries[0]?.concessionaireId ?? "",
      });
    } else if (open) {
      form.reset({
        email: "",
        name: "",
        role: "CONCESSIONAIRE",
        concessionaireId: "",
      });
    }
  }, [open, user, form]);

  const handleSubmit = (data: UserFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information."
              : "Create a new user account. They will receive a default password."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CONCESSIONAIRE">Concessionaire</SelectItem>
                      <SelectItem value="HEADOFFICE">Head Office</SelectItem>
                      <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedRole === "CONCESSIONAIRE" && (
              <FormField
                control={form.control}
                name="concessionaireId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concessionaire</FormLabel>
                    <FormControl>
                      <ConcessionaireCombobox
                        value={field.value ?? null}
                        onValueChange={(value) => {
                          field.onChange(value ?? "");
                        }}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
