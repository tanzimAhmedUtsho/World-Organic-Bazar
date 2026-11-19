import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import type { StoreCategory, StoreProduct } from "@/lib/products";
import { ProductCard } from "@/components/products/product-card";

type StorefrontProps = {
  products: StoreProduct[];
  categories: StoreCategory[];
  total: number;
  page: number;
  pages: number;
  initialQuery?: string;
  categorySlug?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
};

export function Storefront({ products, categories, total, page, pages, initialQuery = "", categorySlug = "", sort = "featured", minPrice, maxPrice }: StorefrontProps) {
  const currentCategory = categories.find((category) => category.slug === categorySlug);
  return <>
    <section className="shop-intro"><div><span className="eyebrow">বাজার / {total.toLocaleString("bn-BD")}টি পণ্য</span><h1>{currentCategory ? currentCategory.name : <>বাংলার খাঁটি<br /><em>খাবারের বাজার।</em></>}</h1></div><p>{currentCategory?.description || "বাংলাদেশের চেনা স্বাদ আর ঐতিহ্যবাহী খাবার খুঁজে নিন। যত্নে বাছাই করা পণ্য দেখুন, ওজন ও দাম বেছে অর্ডার করুন।"}</p></section>
    <section className="market" id="products">
      <div className="market-toolbar">
        <nav className="category-tabs" aria-label="পণ্যের বিভাগ"><Link className={!categorySlug ? "category-tab active" : "category-tab"} href="/shop">সব পণ্য</Link>{categories.map((category) => <Link key={category.id} className={categorySlug === category.slug ? "category-tab active" : "category-tab"} href={`/category/${category.slug}`}><span>{category.name}</span></Link>)}</nav>
        <form className="market-filter-form" action={currentCategory ? `/category/${currentCategory.slug}` : "/shop"}>
          <label className="catalog-search"><Search size={16} /><input aria-label="পণ্য খুঁজুন" name="q" placeholder="পণ্য খুঁজুন" defaultValue={initialQuery} /></label>
          <label className="sort-select"><SlidersHorizontal size={15} /><select aria-label="পণ্য সাজান" name="sort" defaultValue={sort}><option value="featured">জনপ্রিয়</option><option value="price-asc">দাম: কম থেকে বেশি</option><option value="price-desc">দাম: বেশি থেকে কম</option><option value="newest">নতুন পণ্য</option><option value="name">নাম অনুযায়ী</option></select></label>
          <label className="price-filter"><span>সর্বনিম্ন ৳</span><input name="min" inputMode="numeric" type="number" min="0" placeholder="০" defaultValue={minPrice} /></label>
          <label className="price-filter"><span>সর্বোচ্চ ৳</span><input name="max" inputMode="numeric" type="number" min="0" placeholder="—" defaultValue={maxPrice} /></label>
          <button className="filter-submit">ফিল্টার</button>
        </form>
      </div>
      <div className="results-line"><span>{total.toLocaleString("bn-BD")}টি পণ্য</span><span>দাম বাংলাদেশি টাকায় · ওজন বেছে নিন</span></div>
      {products.length ? <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-results"><span>এই খোঁজে কোনো পণ্য পাওয়া যায়নি।</span><p>অন্যভাবে খুঁজুন অথবা সব পণ্য দেখুন।</p><Link className="text-link" href="/shop">সব পণ্য দেখুন →</Link></div>}
      {pages > 1 && <nav className="pagination" aria-label="পণ্যের পৃষ্ঠা">{page > 1 && <Link href={pageHref(page - 1, currentCategory, initialQuery, sort, minPrice, maxPrice)}>← আগের পৃষ্ঠা</Link>}<span>পৃষ্ঠা {page.toLocaleString("bn-BD")} / {pages.toLocaleString("bn-BD")}</span>{page < pages && <Link href={pageHref(page + 1, currentCategory, initialQuery, sort, minPrice, maxPrice)}>পরের পৃষ্ঠা →</Link>}</nav>}
    </section>
  </>;
}

function pageHref(page: number, category: StoreCategory | undefined, query: string, sort: string, minPrice?: number, maxPrice?: number) {
  const params = new URLSearchParams({ page: String(page), sort });
  if (query) params.set("q", query);
  if (minPrice !== undefined) params.set("min", String(minPrice));
  if (maxPrice !== undefined) params.set("max", String(maxPrice));
  return `${category ? `/category/${category.slug}` : "/shop"}?${params.toString()}`;
}
