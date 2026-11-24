import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getStoreProduct, getStoreProducts, formatPrice } from "@/lib/products";
import { ProductCard } from "@/components/products/product-card";
import { ProductDetailActions } from "@/components/products/product-detail-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  return product ? { title: product.name, description: product.shortDescription || product.description, openGraph: { title: product.name, description: product.shortDescription || product.description, images: [{ url: product.image }] } } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  if (!product) notFound();
  const related = product.categorySlug ? await getStoreProducts({ categorySlug: product.categorySlug, pageSize: 5 }) : { products: [] };
  const offers = product.variants.map((variant) => ({ "@type": "Offer", priceCurrency: "BDT", price: variant.price.toFixed(2), availability: variant.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", sku: variant.sku }));
  const structuredProduct = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: product.name, alternateName: product.banglaName, description: product.shortDescription || product.description, image: [product.image], category: product.category, offers: offers.length === 1 ? offers[0] : offers }).replace(/</g, "\\u003c");
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const breadcrumbData = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "হোম", item: base }, { "@type": "ListItem", position: 2, name: "সব পণ্য", item: `${base}/shop` }, { "@type": "ListItem", position: 3, name: product.name, item: `${base}/product/${product.slug}` }] }).replace(/</g, "\\u003c");
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredProduct }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbData }} /><main className="product-page"><div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><Link href="/shop">সব পণ্য</Link><span>/</span><span>{product.name}</span></div><div className="product-detail"><div className="detail-image-wrap"><Image src={product.image} alt={product.name} fill priority sizes="(max-width: 760px) 100vw, 55vw" className="detail-image" /></div><div className="detail-copy"><span className="eyebrow">{product.category} / {product.variants.length.toLocaleString("bn-BD")}টি ওজন</span><h1>{product.name}</h1>{product.rating !== null && <div className="detail-rating"><Star size={14} fill="currentColor" /> {product.rating.toLocaleString("bn-BD", { maximumFractionDigits: 1 })} <span>·</span> যাচাইকৃত ক্রেতার মতামত</div>}<p className="detail-description">{product.shortDescription || product.description}</p><p className="detail-price">{formatPrice(product.price)} <span>/ {product.unit}</span></p><ProductDetailActions product={product} />{product.origin && <div className="origin-card"><div><span>উৎপত্তি</span><strong>{product.origin}</strong></div></div>}<div className="detail-note"><span>পণ্যের বিস্তারিত</span><p>{product.description}</p></div><div className="product-assurances" aria-label="অর্ডার ও ডেলিভারির তথ্য"><div><strong>পেমেন্ট</strong><span>পণ্য হাতে পেয়ে মূল্য দিন</span></div><div><strong>ডেলিভারি চার্জ</strong><span>জেলা বেছে checkout-এ দেখে নিন</span></div><div><strong>সহায়তা</strong><span><Link href="/contact">যোগাযোগের তথ্য দেখুন →</Link></span></div></div></div></div>{related.products.filter((item) => item.id !== product.id).length > 0 && <section className="related-products"><div className="section-heading"><div><span className="eyebrow">{product.category} থেকে আরও</span><h2>আরও কিছু<br /><em>দেখে নিন।</em></h2></div><Link href={`/category/${product.categorySlug}`} className="text-link">এই বিভাগে দেখুন →</Link></div><div className="product-grid">{related.products.filter((item) => item.id !== product.id).slice(0, 4).map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div></section>}</main></>;
}
