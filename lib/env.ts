import { z } from "zod";

const envSchema = z.object({
  CAL_API_KEY: z.string().min(1, "CAL_API_KEY is required"),
  CAL_EVENT_TYPE_ID: z
    .string()
    .min(1, "CAL_EVENT_TYPE_ID is required")
    .regex(/^\d+$/, "CAL_EVENT_TYPE_ID must be numeric"),
  CAL_API_URL: z
    .string()
    .url("CAL_API_URL must be a valid URL")
    .default("https://api.cal.com/v2"),
  CAL_TIMEZONE: z.string().min(1).default("America/New_York"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}\n` +
        `Check your .env.local against .env.example.`,
    );
  }
  return {
    ...parsed.data,
    // Strip trailing slash so URL building is predictable.
    CAL_API_URL: parsed.data.CAL_API_URL.replace(/\/$/, ""),
    CAL_EVENT_TYPE_ID_NUM: Number(parsed.data.CAL_EVENT_TYPE_ID),
  };
}

export const env = loadEnv();
