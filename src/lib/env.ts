import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]),
  VITE_ENABLE_MSW: z.string().optional(),
  VITE_GOOGLE_MAPS_API_KEY: z.string(),
  VITE_GOOGLE_MAPS_MAP_ID: z.string(),
});

export const env = envSchema.parse(import.meta.env);
