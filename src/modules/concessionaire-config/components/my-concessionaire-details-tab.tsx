import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useUpdateMyConcessionaire } from "../hooks/use-update-my-concessionaire";
import type { Concessionaire } from "../types/concessionaire-config.types";

const detailsFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().min(1, "Address is required").max(500),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  telegramChatId: z.string().optional().or(z.literal("")),
});

type DetailsFormValues = z.infer<typeof detailsFormSchema>;

interface MyConcessionaireDetailsTabProps {
  concessionaire: Concessionaire;
}

export function MyConcessionaireDetailsTab({ concessionaire }: MyConcessionaireDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMyConcessionaire = useUpdateMyConcessionaire();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<DetailsFormValues, any, DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: {
      name: concessionaire.name,
      address: concessionaire.address,
      latitude: String(concessionaire.latitude),
      longitude: String(concessionaire.longitude),
      telegramChatId: concessionaire.telegramChatId ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: concessionaire.name,
      address: concessionaire.address,
      latitude: String(concessionaire.latitude),
      longitude: String(concessionaire.longitude),
      telegramChatId: concessionaire.telegramChatId ?? "",
    });
  }, [concessionaire, form]);

  function handleCancel() {
    form.reset();
    setIsEditing(false);
  }

  function handleSubmit(data: DetailsFormValues) {
    updateMyConcessionaire.mutate(
      {
        name: data.name,
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        telegramChatId: data.telegramChatId ?? null,
      },
      {
        onSuccess: () => {
          toast.success("Concessionaire updated successfully");
          setIsEditing(false);
        },
        onError: () => toast.error("Failed to update concessionaire"),
      }
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update your concessionaire's name, address, and location."
                : "Your concessionaire's name, address, and location."}
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
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground text-sm">{concessionaire.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Address</p>
                <p className="text-muted-foreground text-sm">{concessionaire.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Latitude</p>
                  <p className="text-muted-foreground text-sm">{concessionaire.latitude}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Longitude</p>
                  <p className="text-muted-foreground text-sm">{concessionaire.longitude}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Telegram Chat ID</p>
                <p className="text-muted-foreground text-sm">
                  {concessionaire.telegramChatId ?? "—"}
                </p>
              </div>
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="telegramChatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram Chat ID</FormLabel>
                      <FormControl>
                        <Input placeholder="-1001234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a private chat ID (e.g. <code>123456789</code>) or group chat ID (e.g.{" "}
                        <code>-1001234567890</code>).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={updateMyConcessionaire.isPending}>
                    {updateMyConcessionaire.isPending ? "Saving..." : "Save Changes"}
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

      <Card>
        <CardHeader>
          <CardTitle>Alert Emails</CardTitle>
          <CardDescription>
            Contact your administrator to change alert email addresses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {concessionaire.alertEmails && concessionaire.alertEmails.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {concessionaire.alertEmails.map((email) => (
                <Badge key={email} variant="secondary">
                  {email}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No alert emails configured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
