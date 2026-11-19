import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } } });
  return post ? { title: post.seoTitle || post.titleEn, description: post.seoDescription || post.excerpt || undefined, openGraph: { images: post.featuredImage ? [{ url: post.featuredImage }] : [] } } : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } }, include: { category: true } });
  if (!post) notFound();
  return <main className="blog-detail-page"><div className="breadcrumb"><Link href="/blog">BLOG & RECIPES</Link><span>/</span><span>{post.titleEn.toUpperCase()}</span></div><article className="blog-detail"><span className="eyebrow">{post.category?.name || "FOOD NOTES"} · {post.publishedAt && new Intl.DateTimeFormat("en-BD", { dateStyle: "long" }).format(post.publishedAt)}</span><h1>{post.titleEn}</h1>{post.titleBn && <h2 lang="bn">{post.titleBn}</h2>}{post.featuredImage && <div className="blog-detail-image"><Image src={post.featuredImage} alt={post.titleEn} fill priority sizes="(max-width: 900px) 100vw, 900px" /></div>}{post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}<div className="blog-content">{post.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{post.tags.length > 0 && <div className="blog-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}</article></main>;
}
