import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date")
  .refine((s) => !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime()), {
    message: "Not a real calendar date",
  });

const checkAvailabilitySchema = z
  .object({
    action: z.literal("check_availability"),
    startDate: dateOnly,
    endDate: dateOnly,
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

const createBookingSchema = z.object({
  action: z.literal("create_booking"),
  start: z
    .string()
    .min(1, "start is required")
    .refine((s) => !Number.isNaN(new Date(s).getTime()) || /^\d{4}-\d{2}-\d{2}T/.test(s), {
      message: "start must be an ISO-8601 timestamp",
    }),
  name: z.string().trim().min(1, "name is required").max(120),
  email: z.string().trim().email("A valid email is required"),
  number: z.string().trim().min(7, "A valid phone number is required").max(20),
  notes: z.string().trim().max(500).optional(),
});

const cancelBookingSchema = z.object({
  action: z.literal("cancel_booking"),
  bookingId: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .pipe(z.string().min(1, "bookingId is required")),
  reason: z.string().trim().max(500).optional(),
});

export const voicePayloadSchema = z.discriminatedUnion("action", [
  checkAvailabilitySchema,
  createBookingSchema,
  cancelBookingSchema,
]);

export type CheckAvailabilityPayload = z.infer<typeof checkAvailabilitySchema>;
export type CreateBookingPayload = z.infer<typeof createBookingSchema>;
export type CancelBookingPayload = z.infer<typeof cancelBookingSchema>;
