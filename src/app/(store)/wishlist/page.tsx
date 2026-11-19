import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { catalogInclude, mapStoreProduct } from "@/lib/products";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "পছন্দের পণ্য", description: "বাজার থেকে আপনার সংরক্ষিত পণ্যগুলো দেখুন।" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=%2Fwishlist");
  const wishlist = await prisma.wishlist.findUnique({ where: { userId: session.user.id }, include: { items: { include: { product: { include: catalogInclude } }, orderBy: { createdAt: "desc" } } } });
  const products = wishlist?.items.map((item) => mapStoreProduct(item.product)) ?? [];
  return <main className="shop-page wishlist-page"><div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>পছন্দের পণ্য</span></div><div className="shop-intro"><div><span className="eyebrow">পরে দেখার জন্য রেখেছেন</span><h1>আপনার <em>পছন্দ।</em></h1></div><p>আপনার পছন্দের পণ্য অ্যাকাউন্টে সংরক্ষিত থাকে—যখন দরকার ফিরে দেখুন।</p></div>{products.length ? <section className="product-grid wishlist-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</section> : <div className="basket-empty"><span className="basket-empty-icon"><Heart /></span><h2>এখনো কোনো পণ্য সংরক্ষণ করেননি।</h2><p>বাজারের কোনো পণ্যে হৃদয়ের চিহ্ন চাপলে সেটি এখানে থাকবে।</p><Link className="button button-green" href="/shop">বাজার দেখুন</Link></div>}</main>;
}
