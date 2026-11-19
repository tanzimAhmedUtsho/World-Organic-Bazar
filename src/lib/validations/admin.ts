import { z } from "zod";

export const productInputSchema = z.object({
  nameEn: z.string().trim().min(2).max(160),
  nameBn: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(10_000),
  shortDescription: z.string().trim().max(500).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  origin: z.string().trim().max(160).optional(),
  seoTitle: z.string().trim().max(180).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  categoryIds: z.array(z.string().min(1)).max(10),
  imageUrls: z.array(z.string().url().max(1000)).min(1).max(12),
  variants: z.array(z.object({
    id: z.string().optional(),
    sku: z.string().trim().min(2).max(80),
    label: z.string().trim().min(1).max(80),
    weightGrams: z.number().int().positive().optional(),
    price: z.number().positive().max(10_000_000),
    compareAtPrice: z.number().positive().max(10_000_000).optional(),
    stockQuantity: z.number().int().min(0).max(1_000_000),
    lowStockThreshold: z.number().int().min(0).max(100_000),
  })).min(1).max(30),
});

export const categoryInputSchema = z.object({
  nameEn: z.string().trim().min(2).max(140),
  nameBn: z.string().trim().min(2).max(140),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.union([z.string().url().max(1000), z.literal("")]).optional(),
  displayOrder: z.number().int().min(0).max(10000),
  active: z.boolean(),
  seoTitle: z.string().trim().max(180).optional(),
  seoDescription: z.string().trim().max(320).optional(),
});

export const videoInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(5000),
  videoUrl: z.string().url().max(1000).refine((value) => value.startsWith("https://")),
  thumbnailUrl: z.union([z.string().url().max(1000), z.literal("")]).optional(),
  categoryId: z.string().optional(),
  featured: z.boolean(),
  published: z.boolean(),
  displayOrder: z.number().int().min(0).max(10000),
});
