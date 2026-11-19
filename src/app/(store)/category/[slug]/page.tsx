import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Storefront } from "@/components/products/storefront";
import { getStoreCategories, getStoreProducts } from "@/lib/products";
import { parseNonnegativePrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getStoreCategories()).find((item) => item.slug === slug);
  return category ? { title: category.name, description: category.description || `Explore ${category.name} in the World Organic Bazar market.` } : {};
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string; sort?: string; min?: string; max?: string; page?: string }> }) {
  const [{ slug }, query, categories] = await Promise.all([params, searchParams, getStoreCategories()]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const minPrice = parseNonnegativePrice(query.min);
  const maxPrice = parseNonnegativePrice(query.max);
  const result = await getStoreProducts({ categorySlug: slug, query: query.q, sort: query.sort, minPrice, maxPrice, page });
  return <main className="shop-page"><div className="breadcrumb"><a href="/">HOME</a><span>/</span><a href="/shop">THE MARKET</a><span>/</span><span>{category.name.toUpperCase()}</span></div><Storefront {...result} categories={categories} categorySlug={slug} initialQuery={query.q} sort={query.sort} minPrice={minPrice} maxPrice={maxPrice} /></main>;
}
