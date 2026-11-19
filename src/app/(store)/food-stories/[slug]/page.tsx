import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getVideoPresentation } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const video = await prisma.video.findFirst({ where: { slug, published: true } });
  return video ? { title: video.title, description: video.description, openGraph: { images: video.thumbnailUrl ? [{ url: video.thumbnailUrl }] : [] } } : {};
}

export default async function FoodStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await prisma.video.findFirst({ where: { slug, published: true }, include: { category: true } });
  if (!story) notFound();
  const presentation = getVideoPresentation(story.videoUrl);
  return <main className="story-detail-page"><div className="breadcrumb"><Link href="/food-stories">খাদ্যগল্প</Link><span>/</span><span>{story.title}</span></div><article className="story-detail"><span className="eyebrow">{story.category?.name || "খাদ্যগল্প"} · {new Intl.DateTimeFormat("bn-BD", { dateStyle: "long" }).format(story.createdAt)}</span><h1>{story.title}</h1>{presentation.type === "embed" ? <div className="story-player"><iframe src={presentation.url} title={story.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div> : presentation.type === "video" ? <video className="story-player-native" controls preload="metadata" poster={story.thumbnailUrl || undefined}><source src={presentation.url} /></video> : story.thumbnailUrl ? <div className="story-detail-image"><Image src={story.thumbnailUrl} alt={story.title} fill sizes="(max-width: 900px) 100vw, 900px" /></div> : <p className="story-unavailable">এই গল্পের ভিডিও player এখনো প্রস্তুত নয়।</p>}<p className="story-detail-description">{story.description}</p></article></main>;
}
