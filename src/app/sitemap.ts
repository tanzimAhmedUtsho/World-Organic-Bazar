import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const [products, categories, posts, videos] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
    prisma.video.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const staticPages = ["", "/shop", "/our-story", "/food-stories", "/blog", "/contact", "/track-order", "/privacy-policy", "/terms-and-conditions"];
  return [
    ...staticPages.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const })),
    ...products.map((item) => ({ url: `${base}/product/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const })),
    ...categories.map((item) => ({ url: `${base}/category/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const })),
    ...posts.map((item) => ({ url: `${base}/blog/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "monthly" as const })),
    ...videos.map((item) => ({ url: `${base}/food-stories/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "monthly" as const })),
  ];
}
