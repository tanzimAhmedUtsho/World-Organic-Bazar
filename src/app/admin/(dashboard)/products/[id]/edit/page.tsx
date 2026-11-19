import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Product · Admin", robots: { index: false, follow: false } };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("products.manage");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { categories: true, images: { orderBy: { position: "asc" } }, variants: { where: { active: true }, orderBy: { price: "asc" } } } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" }, select: { id: true, nameEn: true, nameBn: true } }),
  ]);
  if (!product) notFound();
  const initial = {
    nameEn: product.nameEn,
    nameBn: product.nameBn,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription ?? "",
    status: product.status,
    featured: product.featured,
    bestSeller: product.bestSeller,
    origin: product.origin ?? "",
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    categoryIds: product.categories.map((item) => item.categoryId),
    imageUrls: product.images.map((item) => item.url),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      label: variant.label,
      weightGrams: variant.weightGrams ?? undefined,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice === null ? undefined : Number(variant.compareAtPrice),
      stockQuantity: variant.stockQuantity,
      lowStockThreshold: variant.lowStockThreshold,
    })),
  };
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCE / CATALOG</span><h1>Edit product</h1><p>{product.nameEn}</p></div></div><ProductForm categories={categories} initial={initial} productId={product.id} /></div>;
}
