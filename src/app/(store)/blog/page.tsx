import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog & Recipes", description: "Food notes, recipes, and stories published by World Organic Bazar." };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" }, include: { category: true } });
  return <main className="stories-page"><div className="breadcrumb"><Link href="/">HOME</Link><span>/</span><span>BLOG & RECIPES</span></div><section className="shop-intro"><div><span className="eyebrow">NOTES FROM THE BAZAR</span><h1>Food for<br />thought, <em>too.</em></h1></div><p>Recipes, ingredients, and food culture notes published by the World Organic Bazar team.</p></section>{posts.length ? <div className="blog-grid">{posts.map((post) => <Link href={`/blog/${post.slug}`} className="blog-card" key={post.id}><div className="blog-image">{post.featuredImage && <Image src={post.featuredImage} alt={post.titleEn} fill sizes="(max-width: 700px) 100vw, 33vw" />}</div><span className="eyebrow">{post.category?.name || "FOOD NOTES"} · {post.publishedAt && new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(post.publishedAt)}</span><h2>{post.titleEn}</h2>{post.titleBn && <h3 lang="bn">{post.titleBn}</h3>}<p>{post.excerpt}</p><span className="text-link">Read the story →</span></Link>)}</div> : <div className="basket-empty"><span className="eyebrow">FOOD NOTES</span><h2>Fresh stories are in the works.</h2><p>Published recipes and stories will appear here.</p></div>}</main>;
}
