import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]),
  VITE_ENABLE_MSW: z.string().optional(),
  VITE_MAPBOX_ACCESS_TOKEN: z.string(),
});

export const env = envSchema.parse(import.meta.env);
