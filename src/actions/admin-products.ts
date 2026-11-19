"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/validations/admin";

type ProductFormInput = unknown;
type ActionResult = { ok: true; id: string } | { ok: false; message: string };

function auditSnapshot(data: ReturnType<typeof productInputSchema.parse>): Prisma.InputJsonValue {
  return {
    nameEn: data.nameEn,
    nameBn: data.nameBn,
    slug: data.slug,
    status: data.status,
    featured: data.featured,
    bestSeller: data.bestSeller,
    categoryIds: data.categoryIds,
    imageUrls: data.imageUrls,
    variants: data.variants.map(({ id, ...variant }) => ({ ...variant, id: id ?? null })),
  } as Prisma.InputJsonValue;
}

export async function saveProduct(input: ProductFormInput, productId?: string): Promise<ActionResult> {
  const admin = await requireAdmin("products.manage");
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the product details and try again." };
  const data = parsed.data;
  const categoryIds = [...new Set(data.categoryIds)];
  if (categoryIds.length !== data.categoryIds.length) return { ok: false, message: "A category was selected more than once." };
  if (data.variants.some((variant) => variant.id) && !productId) return { ok: false, message: "A new product cannot reuse existing variant IDs." };
  if (new Set(data.variants.map((variant) => variant.sku)).size !== data.variants.length) return { ok: false, message: "Each product variation needs a unique SKU." };
  const categories = await prisma.category.count({ where: { id: { in: categoryIds }, active: true } });
  if (categories !== categoryIds.length) return { ok: false, message: "One or more selected categories are no longer available." };

  try {
    const saved = await prisma.$transaction(async (tx) => {
      if (!productId) {
        const product = await tx.product.create({ data: {
          nameEn: data.nameEn,
          nameBn: data.nameBn,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription || null,
          status: data.status,
          featured: data.featured,
          bestSeller: data.bestSeller,
          origin: data.origin || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          sortPrice: Math.min(...data.variants.map((variant) => variant.price)),
          categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
          images: { create: data.imageUrls.map((url, position) => ({ url, position, featured: position === 0, alt: `${data.nameEn} product image` })) },
          variants: { create: data.variants.map(({ id: _id, ...variant }) => ({ ...variant, weightGrams: variant.weightGrams ?? null, compareAtPrice: variant.compareAtPrice ?? null })) },
        } });
        await tx.auditLog.create({ data: { actorId: admin.id, action: "PRODUCT_CREATED", entityType: "Product", entityId: product.id, after: auditSnapshot(data) } });
        return product;
      }

      const before = await tx.product.findUnique({ where: { id: productId }, include: { variants: true, categories: true } });
      if (!before) throw new Error("PRODUCT_NOT_FOUND");
      const existingById = new Map(before.variants.map((variant) => [variant.id, variant]));
      for (const variant of data.variants) if (variant.id && !existingById.has(variant.id)) throw new Error("VARIANT_NOT_FOUND");
      const keepIds = data.variants.flatMap((variant) => variant.id ? [variant.id] : []);
      await tx.productVariant.updateMany({ where: { productId, ...(keepIds.length ? { id: { notIn: keepIds } } : {}) }, data: { active: false } });
      for (const variant of data.variants) {
        const values = { sku: variant.sku, label: variant.label, weightGrams: variant.weightGrams ?? null, price: variant.price, compareAtPrice: variant.compareAtPrice ?? null, stockQuantity: variant.stockQuantity, lowStockThreshold: variant.lowStockThreshold, active: true };
        const previous = variant.id ? existingById.get(variant.id) : undefined;
        if (previous) {
          await tx.productVariant.update({ where: { id: previous.id }, data: values });
          if (previous.stockQuantity !== variant.stockQuantity) await tx.inventoryTransaction.create({ data: { variantId: previous.id, quantity: variant.stockQuantity - previous.stockQuantity, reason: "ADJUSTMENT", actorId: admin.id, note: "Stock changed in product editor." } });
        } else {
          await tx.productVariant.create({ data: { ...values, productId } });
        }
      }
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          nameEn: data.nameEn,
          nameBn: data.nameBn,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription || null,
          status: data.status,
          featured: data.featured,
          bestSeller: data.bestSeller,
          origin: data.origin || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          sortPrice: Math.min(...data.variants.map((variant) => variant.price)),
          categories: { deleteMany: {}, create: categoryIds.map((categoryId) => ({ categoryId })) },
          images: { deleteMany: {}, create: data.imageUrls.map((url, position) => ({ url, position, featured: position === 0, alt: `${data.nameEn} product image` })) },
        },
      });
      await tx.auditLog.create({ data: { actorId: admin.id, action: "PRODUCT_UPDATED", entityType: "Product", entityId: product.id, before: auditSnapshot({ ...data, variants: before.variants.map((variant) => ({ id: variant.id, sku: variant.sku, label: variant.label, weightGrams: variant.weightGrams ?? undefined, price: Number(variant.price), compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined, stockQuantity: variant.stockQuantity, lowStockThreshold: variant.lowStockThreshold })) }), after: auditSnapshot(data) } });
      return product;
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${saved.slug}`);
    revalidatePath("/admin/products");
    return { ok: true, id: saved.id };
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") return { ok: false, message: "This product no longer exists." };
    if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") return { ok: false, message: "A variation no longer belongs to this product. Refresh and try again." };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: false, message: "That slug or SKU is already in use." };
    console.error("Product save failed", error);
    return { ok: false, message: "The product could not be saved. Please try again." };
  }
}

export async function archiveProduct(productId: string): Promise<ActionResult> {
  const admin = await requireAdmin("products.manage");
  if (!productId || productId.length > 64) return { ok: false, message: "Choose a valid product." };
  try {
    const product = await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUnique({ where: { id: productId }, select: { id: true, slug: true, status: true } });
      if (!current) throw new Error("PRODUCT_NOT_FOUND");
      const archived = await tx.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
      await tx.productVariant.updateMany({ where: { productId }, data: { active: false } });
      await tx.auditLog.create({ data: { actorId: admin.id, action: "PRODUCT_ARCHIVED", entityType: "Product", entityId: productId, before: { status: current.status }, after: { status: "ARCHIVED" } } });
      return archived;
    });
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/admin/products"); revalidatePath(`/product/${product.slug}`);
    return { ok: true, id: product.id };
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") return { ok: false, message: "This product no longer exists." };
    console.error("Product archive failed", error);
    return { ok: false, message: "The product could not be archived." };
  }
}
