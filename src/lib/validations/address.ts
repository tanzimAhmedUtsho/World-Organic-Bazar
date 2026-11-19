import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().max(60).optional(),
  recipient: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,20}$/),
  district: z.string().trim().min(2).max(100),
  upazila: z.string().trim().min(2).max(100),
  addressLine: z.string().trim().min(8).max(500),
  instructions: z.string().trim().max(500).optional(),
  isDefault: z.boolean().default(false),
});
