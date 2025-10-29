import { z } from 'zod';

const requiredString = (name: string) => z.string().min(1, `${name} is required`);

const serverSchema = z.object({
  TFL_APP_ID: z.string().min(1).optional(), // Optional until TfL API integration is implemented
  TFL_APP_KEY: z.string().min(1).optional(), // Optional until TfL API integration is implemented
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL').optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  KV_URL: z.string().url('KV_URL must be a valid URL').optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  KV_REST_API_READ_ONLY_TOKEN: z.string().min(1).optional(),
  KV_REST_API_ID: z.string().min(1).optional(),
  LOGTAIL_TOKEN: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: requiredString('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN'),
  NEXT_PUBLIC_MAPBOX_STYLE_ID: requiredString('NEXT_PUBLIC_MAPBOX_STYLE_ID'),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url('NEXT_PUBLIC_POSTHOG_HOST must be a valid URL')
    .default('https://app.posthog.com'),
});

const coerceOptional = (value: string | undefined) =>
  value && value.trim().length > 0 ? value : undefined;

const formatErrors = (errors: z.ZodIssue[]) =>
  errors
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('\n');

const serverResult = serverSchema.safeParse({
  TFL_APP_ID: coerceOptional(process.env.TFL_APP_ID),
  TFL_APP_KEY: coerceOptional(process.env.TFL_APP_KEY),
  UPSTASH_REDIS_REST_URL: coerceOptional(process.env.UPSTASH_REDIS_REST_URL),
  UPSTASH_REDIS_REST_TOKEN: coerceOptional(process.env.UPSTASH_REDIS_REST_TOKEN),
  KV_URL: coerceOptional(process.env.KV_URL),
  KV_REST_API_TOKEN: coerceOptional(process.env.KV_REST_API_TOKEN),
  KV_REST_API_READ_ONLY_TOKEN: coerceOptional(process.env.KV_REST_API_READ_ONLY_TOKEN),
  KV_REST_API_ID: coerceOptional(process.env.KV_REST_API_ID),
  LOGTAIL_TOKEN: coerceOptional(process.env.LOGTAIL_TOKEN),
});

if (!serverResult.success) {
  throw new Error(`Invalid server environment variables:\n${formatErrors(serverResult.error.issues)}`);
}

const clientResult = clientSchema.safeParse({
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  NEXT_PUBLIC_MAPBOX_STYLE_ID: process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID,
  NEXT_PUBLIC_POSTHOG_KEY: coerceOptional(process.env.NEXT_PUBLIC_POSTHOG_KEY),
  NEXT_PUBLIC_POSTHOG_HOST: coerceOptional(process.env.NEXT_PUBLIC_POSTHOG_HOST),
});

if (!clientResult.success) {
  throw new Error(`Invalid client environment variables:\n${formatErrors(clientResult.error.issues)}`);
}

export const serverEnv = serverResult.data;
export const clientEnv = clientResult.data;
