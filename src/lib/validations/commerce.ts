import { z } from "zod";

export const cartLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().regex(/^\+?[0-9\s()-]{8,20}$/),
  customerEmail: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  district: z.string().trim().min(2).max(100),
  upazila: z.string().trim().min(2).max(100),
  addressLine: z.string().trim().min(8).max(500),
  deliveryInstructions: z.string().trim().max(500).optional(),
  paymentMethod: z.literal("COD"),
  couponCode: z.string().trim().max(40).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
