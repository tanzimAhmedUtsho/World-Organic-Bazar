import { Prisma, type ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { displayText } from "@/lib/display-text";

export const catalogInclude = {
  images: { orderBy: { position: Prisma.SortOrder.asc } },
  categories: { include: { category: true } },
  variants: { where: { active: true }, orderBy: { price: Prisma.SortOrder.asc } },
  reviews: { where: { status: "APPROVED" as const, demo: false }, select: { rating: true } },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof catalogInclude }>;

export type StoreVariant = {
  id: string;
  sku: string;
  label: string;
  weightGrams: number | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  banglaName: string;
  description: string;
  shortDescription: string;
  category: string;
  categorySlug: string;
  image: string;
  rating: number | null;
  origin: string;
  featured: boolean;
  bestSeller: boolean;
  variants: StoreVariant[];
  price: number;
  compareAtPrice: number | null;
  unit: string;
  stockQuantity: number;
  available: boolean;
};

export type StoreCategory = { id: string; name: string; banglaName: string; slug: string; description: string; image: string; count: number };

export function formatVariantLabel(label: string, weightGrams: number | null): string {
  const fallback = weightGrams ? `${weightGrams.toLocaleString("bn-BD")} গ্রাম` : "প্যাক";
  return displayText(label, fallback);
}

export function mapStoreProduct(product: ProductRecord): StoreProduct {
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    label: formatVariantLabel(variant.label, variant.weightGrams),
    weightGrams: variant.weightGrams,
    price: Number(variant.price),
    compareAtPrice: variant.compareAtPrice === null ? null : Number(variant.compareAtPrice),
    stockQuantity: variant.stockQuantity,
  }));
  const lowest = variants[0];
  const ratings = product.reviews.map(({ rating }) => rating);
  const category = product.categories[0]?.category;
  return {
    id: product.id,
    slug: product.slug,
    name: displayText(product.nameBn, product.nameEn),
    banglaName: product.nameEn,
    description: product.description,
    shortDescription: product.shortDescription ?? "",
    category: displayText(category?.nameBn, category?.nameEn ?? "বাজার"),
    categorySlug: category?.slug ?? "",
    image: product.images.find((image) => image.featured)?.url ?? product.images[0]?.url ?? "/images/product-placeholder.svg",
    rating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
    origin: product.origin ?? "",
    featured: product.featured,
    bestSeller: product.bestSeller,
    variants,
    price: lowest?.price ?? 0,
    compareAtPrice: lowest?.compareAtPrice ?? null,
    unit: lowest?.label ?? "Unavailable",
    stockQuantity: variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    available: variants.some((variant) => variant.stockQuantity > 0),
  };
}

export async function getStoreProducts(options: {
  query?: string;
  categorySlug?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
} = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, options.pageSize ?? 24));
  const search = options.query?.trim().slice(0, 100);
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE" satisfies ProductStatus,
    variants: { some: { active: true, stockQuantity: { gt: 0 } } },
    ...(options.categorySlug ? { categories: { some: { category: { slug: options.categorySlug, active: true } } } } : {}),
    ...(search ? { OR: [
      { nameEn: { contains: search, mode: "insensitive" } },
      { nameBn: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ] } : {}),
    ...(options.minPrice !== undefined || options.maxPrice !== undefined ? { variants: { some: {
      active: true,
      stockQuantity: { gt: 0 },
      price: { ...(options.minPrice !== undefined ? { gte: options.minPrice } : {}), ...(options.maxPrice !== undefined ? { lte: options.maxPrice } : {}) },
    } } } : {}),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = options.sort === "price-asc"
    ? [{ sortPrice: "asc" }, { nameEn: "asc" }]
    : options.sort === "price-desc" ? [{ sortPrice: "desc" }, { nameEn: "asc" }]
    : options.sort === "newest" ? [{ createdAt: "desc" }]
      : options.sort === "name" ? [{ nameEn: "asc" }]
        : [{ bestSeller: "desc" }, { featured: "desc" }, { createdAt: "desc" }];
  const [records, total] = await Promise.all([
    prisma.product.findMany({ where, include: catalogInclude, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.product.count({ where }),
  ]);
  const products = records.map(mapStoreProduct);
  return { products, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getStoreProduct(slug: string) {
  const product = await prisma.product.findFirst({ where: { slug, status: "ACTIVE" }, include: catalogInclude });
  return product ? mapStoreProduct(product) : null;
}

export async function getStoreCategories(): Promise<StoreCategory[]> {
  const categories = await prisma.category.findMany({ where: { active: true, parentId: null }, orderBy: { displayOrder: "asc" } });
  return Promise.all(categories.map(async (category) => ({
    id: category.id,
    name: displayText(category.nameBn, category.nameEn),
    banglaName: displayText(category.nameBn, category.nameEn),
    slug: category.slug,
    description: category.description ?? "",
    image: category.imageUrl ?? "/images/category-placeholder.svg",
    count: await prisma.productCategory.count({ where: { categoryId: category.id, product: { status: "ACTIVE" } } }),
  })));
}

export const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;
