import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useUpdateConcessionaire } from "../hooks/use-update-concessionaire";
import type { Concessionaire } from "../types/concessionaire-management.types";

const detailsFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().min(1, "Address is required").max(500),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  telegramChatId: z.string().optional().or(z.literal("")),
  alertEmails: z.string().optional(),
});

type DetailsFormValues = z.infer<typeof detailsFormSchema>;

interface ConcessionaireDetailsTabProps {
  concessionaire: Concessionaire;
}

export function ConcessionaireDetailsTab({ concessionaire }: ConcessionaireDetailsTabProps) {
  const updateConcessionaire = useUpdateConcessionaire();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<DetailsFormValues, any, DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: {
      name: concessionaire.name,
      address: concessionaire.address,
      latitude: String(concessionaire.latitude),
      longitude: String(concessionaire.longitude),
      telegramChatId: concessionaire.telegramChatId ?? "",
      alertEmails: concessionaire.alertEmails?.join(", ") ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: concessionaire.name,
      address: concessionaire.address,
      latitude: String(concessionaire.latitude),
      longitude: String(concessionaire.longitude),
      telegramChatId: concessionaire.telegramChatId ?? "",
      alertEmails: concessionaire.alertEmails?.join(", ") ?? "",
    });
  }, [concessionaire, form]);

  function handleSubmit(data: DetailsFormValues) {
    const alertEmails = data.alertEmails
      ? data.alertEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
      : undefined;

    updateConcessionaire.mutate(
      {
        id: concessionaire.id,
        data: {
          name: data.name,
          address: data.address,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          telegramChatId: data.telegramChatId || null,
          alertEmails,
        },
      },
      {
        onSuccess: () => {
          toast.success("Concessionaire updated successfully");
        },
        onError: () => {
          toast.error("Failed to update concessionaire");
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
        className="max-w-lg space-y-4"
      >
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alertEmails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert Emails</FormLabel>
              <FormControl>
                <Input placeholder="alert@example.com, alert2@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateConcessionaire.isPending}>
          {updateConcessionaire.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
