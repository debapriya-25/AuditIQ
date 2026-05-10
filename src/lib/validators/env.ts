import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type EnvVars = z.infer<typeof envSchema>;

/**
 * Validates critical environment variables required for the application to run.
 * Safe to call at boot time or inside database/redis client initialization.
 * Prevents silent failures in production.
 */
export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Note: Do not use logger here to prevent circular dependencies at boot time,
    // and this should aggressively fail the build/boot if invalid.
    throw new Error(`Invalid environment variables: ${JSON.stringify(parsed.error.format())}`);
  }
  return parsed.data;
}
