import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Utensils } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "আমাদের গল্প", description: "World অর্গানিক বাজারের প্রতিষ্ঠাতা ও শুরুর গল্প জানুন।" };

export default async function OurStoryPage() {
  const section = await prisma.homepageSection.findUnique({ where: { key: "our-story" } });
  const content = section?.content as { founders?: string[]; copy?: string; image?: string } | undefined;
  const founders = content?.founders ?? ["তানজিম আহমেদ উত্‌শো", "জাবির আহমেদ তুর্জো"];
  return <main className="our-story-page"><div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>আমাদের গল্প</span></div><section className="story-hero"><div><span className="eyebrow">WORLD অর্গানিক বাজার · বাংলাদেশ</span><h1 lang="bn">শুধু খাবার নয়,<br />শিকড়ের গল্প।</h1><p>{content?.copy || "বাংলাদেশের খাঁটি খাবার, ঐতিহ্যবাহী স্বাদ আর মানুষের গল্প নিয়ে আমাদের এই বাজার।"}</p></div><span className="story-hero-stamp">খাঁটি<br />·<br />ঐতিহ্য<br />·<br />বাংলাদেশ</span></section><section className="story-section our-story-main"><div className="story-image"><Image src={content?.image || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85"} alt="বাংলাদেশের ঐতিহ্যবাহী খাবার ও উপকরণ" fill sizes="(max-width: 800px) 100vw, 50vw" className="cover-image" /></div><div className="story-copy"><span className="eyebrow">আমাদের শুরুর কথা</span><h2>খাবারের সঙ্গে<br /><em>ঘরের টান।</em></h2><p>World অর্গানিক বাজারে পাবেন চেনা খাবার, স্মৃতিমাখা স্বাদ আর বাংলাদেশের রান্নাঘরের পরিচিত উপকরণ।</p><p>আমরা পণ্যের তথ্য স্পষ্টভাবে তুলে ধরতে চাই, যাতে প্রতিটি খাবারের প্রকৃত উৎস ও গল্প সঠিকভাবে জানানো যায়।</p><Link href="/shop" className="text-link">বাজার ঘুরে দেখুন <ArrowRight size={15} /></Link></div></section><section className="values-section"><div><span className="eyebrow">আমাদের কাছে যা গুরুত্বপূর্ণ</span><h2>যত্নে গড়া <em>বাজার।</em></h2></div><div className="values-grid"><article><Heart /><h3>বিশ্বাস</h3><p>স্পষ্ট তথ্য দেখে ক্রেতারা নিজের পছন্দে পণ্য বেছে নিতে পারেন।</p></article><article><Leaf /><h3>যত্ন</h3><p>উপকরণ, ওজন ও উৎপত্তির তথ্য গুরুত্ব দিয়ে উপস্থাপন করি।</p></article><article><Utensils /><h3>ঐতিহ্য</h3><p>বাংলাদেশের খাবারের বৈচিত্র্য ও সংস্কৃতি উদ্‌যাপনের যোগ্য।</p></article></div></section><section className="founders-section"><span className="eyebrow">প্রতিষ্ঠাতারা</span><h2>একটি ভাবনা থেকে <em>শুরু।</em></h2><div className="founder-cards">{founders.map((founder, index) => <article className="founder-card" key={founder}><span>০{index + 1}</span><h3>{founder}</h3><p>সহ-প্রতিষ্ঠাতা · World অর্গানিক বাজার</p></article>)}</div></section></main>;
}
