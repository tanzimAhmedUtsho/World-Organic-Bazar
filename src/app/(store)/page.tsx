import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Leaf, MapPin, Play, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { getStoreCategories, getStoreProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "World অর্গানিক বাজার", description: "বাংলাদেশের ঐতিহ্যবাহী ও খাঁটি খাবারের যত্নে বাছাই করা বাজার।" };

export default async function HomePage() {
  const [hero, sections, categories, bestsellers, videos, reviews] = await Promise.all([
    prisma.banner.findUnique({ where: { key: "hero" } }),
    prisma.homepageSection.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    getStoreCategories(),
    getStoreProducts({ sort: "featured", pageSize: 4 }),
    prisma.video.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }], take: 3, include: { category: true } }),
    prisma.review.findMany({ where: { status: "APPROVED", verifiedPurchase: true, demo: false }, orderBy: { createdAt: "desc" }, take: 3, include: { product: { select: { nameBn: true } } } }),
  ]);
  const section = (key: string) => sections.find((item) => item.key === key);
  const whyContent = section("why-choose-us")?.content as { cards?: string[] } | undefined;
  const seasonalContent = section("seasonal")?.content as { title?: string; visible?: boolean; body?: string; image?: string; productSlugs?: string[] } | undefined;
  const storyContent = section("our-story")?.content as { founders?: string[]; copy?: string } | undefined;
  const activeSeasonal = seasonalContent?.visible === true;

  return <main>
    <section className="hero bazar-hero bazar-hero-bn"><div className="hero-visual">{hero?.imageUrl && <Image src={hero.imageUrl} alt="বাংলাদেশের তাজা খাবার ও কৃষিপণ্য" fill priority sizes="100vw" className="hero-image" />}</div><div className="hero-copy"><span className="eyebrow light">দেশের মাটি থেকে আপনার টেবিলে</span><h1 lang="bn">খাঁটি খাবারের স্বাদ ফিরুক শিকড়ে</h1><p>প্রকৃতির কাছাকাছি, বিশুদ্ধতার প্রতিশ্রুতিতে—আপনার প্রতিদিনের খাবারে থাকুক দেশীয় ঐতিহ্য ও আসল স্বাদ।</p><div className="hero-actions"><Link href="/shop" className="button button-light">বাজার ঘুরে দেখুন <ArrowRight size={16} /></Link><Link href="/our-story" className="hero-discover"><span className="round-arrow"><ArrowDown size={15} /></span>আমাদের গল্প</Link></div><div className="hero-caption"><span>খাবার · সংস্কৃতি · শিকড়</span><span>যত্নে বাছাই করা</span></div></div><div className="hero-image-note"><MapPin size={13} /><span>বাংলাদেশের নানা প্রান্তের স্বাদ</span></div></section>

    <section className="promise-strip bazar-promise"><div className="promise-lead"><span className="eyebrow">বিশ্বাসের সঙ্গে বাছাই</span><p>শিকড়ের স্বাদ<br />থাকুক প্রতিদিন।</p></div>{(whyContent?.cards ?? ["যত্নে বাছাই করা পণ্য", "পণ্যের স্পষ্ট বিবরণ", "নিরাপদে প্যাক করা", "অর্ডারের আগে ডেলিভারি নিশ্চিত"]).slice(0, 4).map((item, index) => <div className="promise-item" key={item}><span className="promise-icon">{index === 0 ? <Leaf /> : index === 1 ? <MapPin /> : index === 2 ? <Sparkles /> : <ArrowRight />}</span><div><strong>{item}</strong><p>পণ্যের ওজন, দাম ও বিস্তারিত দেখে নিশ্চিন্তে অর্ডার করুন।</p></div></div>)}</section>

    <section className="category-section"><div className="section-heading"><div><span className="eyebrow">বাজার ঘুরে দেখুন</span><h2>আপনার পছন্দের<br /><em>স্বাদ খুঁজুন।</em></h2></div><Link href="/shop" className="text-link">সব পণ্য <ArrowRight size={15} /></Link></div><div className="category-grid">{categories.slice(0, 8).map((category, index) => <Link href={`/category/${category.slug}`} className="category-card" key={category.id}><div className="category-card-image"><Image src={category.image} alt={category.name} fill sizes="(max-width: 700px) 50vw, 25vw" /><span>০{index + 1}</span><ArrowRight size={17} /></div><strong>{category.name}</strong></Link>)}</div></section>

    <section className="season-section" id="seasonal"><div className="section-heading"><div><span className="eyebrow">বাজার / সবার পছন্দ</span><h2>ঐতিহ্যের স্বাদ<br /><em>আপনার টেবিলে।</em></h2></div><Link href="/shop" className="text-link">সব পণ্য দেখুন <ArrowRight size={15} /></Link></div>{bestsellers.products.length ? <div className="product-grid home-products">{bestsellers.products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-results"><span>বাজার সাজানোর কাজ চলছে।</span><p>পণ্য যুক্ত হলে এখানে দেখা যাবে।</p></div>}<div className="season-bottom"><span>প্রতিটি পণ্যের দাম ও ওজন আলাদাভাবে দেওয়া আছে।</span><Link href="/shop" className="button button-outline">পণ্য দেখুন <ArrowRight size={15} /></Link></div></section>

    {activeSeasonal && <section className="campaign-section"><div className="campaign-copy"><span className="eyebrow">মৌসুমি সংগ্রহ</span><h2>{seasonalContent?.title}</h2><p>{seasonalContent?.body}</p><Link href="/shop?collection=seasonal" className="button button-light">সংগ্রহটি দেখুন <ArrowRight size={16} /></Link></div>{seasonalContent?.image && <div className="campaign-image"><Image src={seasonalContent.image} alt={seasonalContent.title || "মৌসুমি পণ্য"} fill sizes="50vw" /></div>}</section>}

    <section className="video-section"><div className="section-heading"><div><span className="eyebrow">স্বাদ, মানুষ ও ঐতিহ্য</span><h2>খাবারের গল্প<br /><em>দেখুন ও জানুন।</em></h2></div><Link href="/food-stories" className="text-link">সব গল্প <ArrowRight size={15} /></Link></div>{videos.length ? <div className="video-grid">{videos.map((video) => <Link href={`/food-stories/${video.slug}`} className="video-card" key={video.id}><div className="video-thumb">{video.thumbnailUrl && <Image src={video.thumbnailUrl} alt={video.title} fill sizes="(max-width: 700px) 100vw, 33vw" />}<span className="video-play"><Play size={16} fill="currentColor" /></span></div><span className="eyebrow">{video.category?.name || "খাদ্যগল্প"}</span><h3>{video.title}</h3><p>{video.description}</p></Link>)}</div> : <div className="video-empty"><span className="video-empty-mark"><Play size={17}/></span><div><strong>ভিডিও গল্প শিগগিরই আসছে</strong><p>আমাদের গল্পের ভিডিও প্রকাশিত হলে এখানে দেখতে পাবেন।</p></div></div>}</section>

    <section className="story-section" id="our-story"><div className="story-image"><Image src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=85" alt="বাগানের ফসল ও টাটকা উপকরণ" fill sizes="(max-width: 800px) 100vw, 50vw" className="cover-image" /><span className="story-image-label">বাংলার ঐতিহ্যবাহী স্বাদ</span></div><div className="story-copy"><span className="eyebrow">আমাদের গল্প / বাজারের পেছনের মানুষ</span><h2>শুধু খাবার নয়,<br /><em>শিকড়ের টান।</em></h2><p>{storyContent?.copy || "World অর্গানিক বাজারে একসঙ্গে আসে বাংলাদেশের খাঁটি খাবার, ঐতিহ্যবাহী স্বাদ এবং আমাদের খাদ্যসংস্কৃতির গল্প।"}</p><div className="founder-list">{(storyContent?.founders ?? ["তানজিম আহমেদ উত্‌শো", "জাবির আহমেদ তুর্জো"]).map((founder) => <span key={founder}>{founder}</span>)}</div><Link href="/our-story" className="text-link">আমাদের সম্পর্কে জানুন <ArrowRight size={15} /></Link></div></section>

    {reviews.length > 0 && <section className="reviews-section"><div className="section-heading"><div><span className="eyebrow">যাচাইকৃত ক্রেতাদের মতামত</span><h2>ক্রেতাদের<br /><em>ভালোবাসা।</em></h2></div></div><div className="review-grid">{reviews.map((review) => <figure className="review-card" key={review.id}><div className="review-stars" aria-label={`${review.rating} এর মধ্যে ৫ তারকা`}>{"★".repeat(review.rating)}</div><blockquote>“{review.content}”</blockquote><figcaption><strong>{review.customerName}</strong><span>যাচাইকৃত ক্রয় · {review.product.nameBn}</span></figcaption></figure>)}</div></section>}

    <section className="newsletter"><div><span className="eyebrow light">বাজারের খবর</span><h2>খাবারের গল্প<br /><em>পৌঁছে যাক আপনার কাছে।</em></h2></div><div className="newsletter-right"><p>নতুন পণ্য, ঐতিহ্যবাহী খাবারের গল্প ও মৌসুমি খবর পেতে ইমেইল দিন।</p><NewsletterForm /></div></section>
  </main>;
}
