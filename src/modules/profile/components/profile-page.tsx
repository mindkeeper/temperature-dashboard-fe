import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Pencil, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/modules/auth";

import { useChangePassword } from "../hooks/use-change-password";
import { useUpdateProfile } from "../hooks/use-update-profile";

// --- Profile Info Form ---
const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileInfoTab() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const roleLabel: Record<string, string> = {
    CONCESSIONAIRE: "Concessionaire",
    HEADOFFICE: "Head Office",
    SUPERADMIN: "Super Admin",
  };

  function handleCancel() {
    form.reset({ name: user?.name ?? "" });
    setIsEditing(false);
  }

  const handleSubmit = (data: ProfileFormValues) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      },
      onError: () => toast.error("Failed to update profile"),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            {isEditing ? "Update your display name." : "Your account details."}
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Email</p>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Role</p>
          <p className="text-muted-foreground text-sm">
            {roleLabel[user?.role ?? ""] ?? user?.role}
          </p>
        </div>
        {user?.role === "CONCESSIONAIRE" && user.concessionaries.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Concessionaire</p>
            <p className="text-muted-foreground text-sm">
              {user.concessionaries[0]?.concessionaireName}
            </p>
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-muted-foreground text-sm">{user?.name}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// --- Change Password Form ---
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function PasswordInput({
  field,
  placeholder = "••••••••",
}: {
  field: React.ComponentProps<"input">;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <InputGroup>
      <InputGroupInput type={show ? "text" : "password"} placeholder={placeholder} {...field} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          onClick={() => {
            setShow((v) => !v);
          }}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

function ChangePasswordTab() {
  const { mutate: changePassword, isPending } = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const handleSubmit = (data: ChangePasswordFormValues) => {
    changePassword(data, {
      onSuccess: () => {
        toast.success("Password changed successfully");
        form.reset();
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message ?? "Failed to change password";
        toast.error(message);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Choose a strong password of at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// --- Profile Page ---
export function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account settings.</p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileInfoTab />
        </TabsContent>
        <TabsContent value="password" className="mt-4">
          <ChangePasswordTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
