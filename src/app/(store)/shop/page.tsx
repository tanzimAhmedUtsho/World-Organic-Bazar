import type { Metadata } from "next";
import { Storefront } from "@/components/products/storefront";
import { getStoreCategories, getStoreProducts } from "@/lib/products";
import { parseNonnegativePrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "সব পণ্য", description: "বাংলাদেশের ঐতিহ্যবাহী খাবার ও পণ্য ঘুরে দেখুন।" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; min?: string; max?: string; page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const minPrice = parseNonnegativePrice(params.min);
  const maxPrice = parseNonnegativePrice(params.max);
  const [result, categories] = await Promise.all([
    getStoreProducts({ query: params.q, sort: params.sort, minPrice, maxPrice, page }),
    getStoreCategories(),
  ]);
  return <main className="shop-page"><div className="breadcrumb"><a href="/">হোম</a><span>/</span><span>সব পণ্য</span></div><Storefront {...result} categories={categories} initialQuery={params.q} sort={params.sort} minPrice={minPrice} maxPrice={maxPrice} /></main>;
}
