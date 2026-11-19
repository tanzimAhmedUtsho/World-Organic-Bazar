import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "খাদ্যগল্প", description: "বাংলার খাবার, উপকরণ ও মানুষের গল্প দেখুন।" };

export default async function FoodStoriesPage() {
  const videos = await prisma.video.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }], include: { category: true } });
  return <main className="stories-page"><div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>খাদ্যগল্প</span></div><section className="shop-intro"><div><span className="eyebrow">খাবার · মানুষ · ঐতিহ্য</span><h1>বাংলার খাবারের<br /><em>গল্প শুনুন।</em></h1></div><p>আমাদের খাদ্যসংস্কৃতি, উপকরণ ও উৎপাদকদের গল্প এখানে দেখুন।</p></section>{videos.length ? <div className="video-grid stories-grid">{videos.map((video) => <Link href={`/food-stories/${video.slug}`} className="video-card" key={video.id}><div className="video-thumb">{video.thumbnailUrl && <Image src={video.thumbnailUrl} alt={video.title} fill sizes="(max-width: 700px) 100vw, 33vw" />}<span className="video-play"><Play size={16} fill="currentColor" /></span></div><span className="eyebrow">{video.category?.name || "খাদ্যগল্প"} · {new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" }).format(video.createdAt)}</span><h3>{video.title}</h3><p>{video.description}</p></Link>)}</div> : <div className="basket-empty"><span className="eyebrow">মাঠের গল্প</span><h2>খাদ্যগল্পের ভিডিও আসছে।</h2><p>আমাদের ভিডিও প্রকাশিত হলে এখানে দেখতে পাবেন।</p></div>}</main>;
}
