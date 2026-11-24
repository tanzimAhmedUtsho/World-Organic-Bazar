import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { RegionalSpecialties } from "@/components/products/regional-specialties";
import { getStoreCategories } from "@/lib/products";
import { displayText } from "@/lib/display-text";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "বাংলাদেশের বিভাগ ও আঞ্চলিক স্বাদ",
  description: "বাংলাদেশের আটটি বিভাগের পরিচিত খাবার ও আঞ্চলিক পণ্য সম্পর্কে জানুন।",
};

export default async function CategoriesPage() {
  const categories = await getStoreCategories();

  return (
    <main className="category-directory-page">
      <div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>বিভাগ</span></div>
      <section className="category-directory-intro">
        <span className="eyebrow">বাংলাদেশ · আট বিভাগ</span>
        <h1>প্রতিটি অঞ্চলের<br /><em>নিজস্ব স্বাদ।</em></h1>
        <p>বাংলাদেশের কোন বিভাগ কোন খাবার ও পণ্যের জন্য পরিচিত, এক নজরে জেনে নিন।</p>
      </section>
      <section className="regional-specialties" aria-labelledby="regional-specialties-title">
        <div className="regional-specialties-heading"><div><span className="eyebrow">আঞ্চলিক খাবার ও পণ্য</span><h2 id="regional-specialties-title">বাংলাদেশের স্বাদ,<br /><em>বিভাগে বিভাগে।</em></h2></div><p>নিচের তালিকায় প্রতিটি অঞ্চলের পরিচিত কিছু খাবার ও পণ্যের উদাহরণ দেওয়া হয়েছে।</p></div>
        <RegionalSpecialties />
      </section>
      {categories.length ? (
        <section className="store-category-list" id="store-categories">
          <div className="store-category-heading"><span className="eyebrow">WORLD ORGANIC BAZAR</span><h2>আমাদের পণ্যের বিভাগ</h2><p>বাজারে থাকা পণ্যগুলো দেখতে একটি বিভাগ বেছে নিন।</p></div>
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
        </section>
      ) : (
        <div className="category-directory-empty"><h2>বিভাগগুলো সাজানো হচ্ছে।</h2><p>এখনই সব পণ্য দেখতে পারেন।</p><Link className="button button-green" href="/shop">সব পণ্য দেখুন</Link></div>
      )}
    </main>
  );
}
