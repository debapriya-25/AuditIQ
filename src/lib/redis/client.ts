import { Redis } from '@upstash/redis';

// Initialize the Upstash Redis client
// Using non-null assertions (!) because these are required for the app to function.
// They should be validated at startup or in the environment variables schema.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
