import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { getStoreCategories } from "@/lib/products";
import { displayText } from "@/lib/display-text";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "পণ্যের বিভাগ",
  description: "World Organic Bazar-এর পণ্যের বিভাগগুলো ঘুরে দেখুন।",
};

export default async function CategoriesPage() {
  const categories = await getStoreCategories();

  return (
    <main className="category-directory-page">
      <div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>বিভাগ</span></div>
      <section className="category-directory-intro">
        <span className="eyebrow">WORLD ORGANIC BAZAR · বিভাগ</span>
        <h1>আপনার পছন্দের<br /><em>স্বাদ খুঁজুন।</em></h1>
        <p>চেনা খাবার ও রান্নার উপকরণগুলো বিভাগ অনুযায়ী দেখুন। প্রতিটি পণ্যের বিবরণ, ওজন ও দাম দেখে বেছে নিন।</p>
      </section>
      {categories.length ? (
        <div className="category-directory-grid">
          {categories.map((category, index) => (
            <Link className="category-directory-card" href={`/category/${category.slug}`} key={category.id}>
              <div className="category-directory-image">
                <SafeImage src={category.image} alt={category.name} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 25vw" fallbackSrc="/images/category-placeholder.svg" />
                <span>০{index + 1}</span><i aria-hidden="true"><ArrowUpRight size={18} /></i>
              </div>
              <div className="category-directory-copy">
                <div><h2>{category.name}</h2><span>{category.count.toLocaleString("bn-BD")}টি পণ্য</span></div>
                <p>{displayText(category.description, `${category.name} বিভাগের পণ্যগুলো দেখুন।`)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="category-directory-empty"><h2>বিভাগগুলো সাজানো হচ্ছে।</h2><p>এখনই সব পণ্য দেখতে পারেন।</p><Link className="button button-green" href="/shop">সব পণ্য দেখুন</Link></div>
      )}
    </main>
  );
}
