import type { Metadata } from "next";
import { ArrowRight, BookOpen, Leaf } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog & Recipes", description: "Food notes, recipes, and stories published by World Organic Bazar." };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" }, include: { category: true } });
  return <main className="stories-page"><div className="breadcrumb"><Link href="/">HOME</Link><span>/</span><span>BLOG & RECIPES</span></div><section className="shop-intro"><div><span className="eyebrow">NOTES FROM THE BAZAR</span><h1>Food for<br />thought, <em>too.</em></h1></div><p>Recipes, ingredients, and food culture notes published by the World Organic Bazar team.</p></section>{posts.length ? <div className="blog-grid">{posts.map((post) => <Link href={`/blog/${post.slug}`} className="blog-card" key={post.id}><div className="blog-image">{post.featuredImage && <SafeImage src={post.featuredImage} alt={post.titleEn} fill sizes="(max-width: 700px) 100vw, 33vw" fallbackSrc="/images/category-placeholder.svg" />}</div><span className="eyebrow">{post.category?.name || "FOOD NOTES"} · {post.publishedAt && new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(post.publishedAt)}</span><h2>{post.titleEn}</h2>{post.titleBn && <h3 lang="bn">{post.titleBn}</h3>}<p>{post.excerpt}</p><span className="text-link">Read the story →</span></Link>)}</div> : <section className="blog-empty"><div className="blog-empty-art" aria-hidden="true"><span className="blog-empty-sun" /><span className="blog-empty-leaf"><Leaf /></span><span className="blog-empty-book"><BookOpen /></span></div><div className="blog-empty-copy"><span className="eyebrow">A NOTE FROM OUR KITCHEN</span><h2>Our next story<br /><em>is being prepared.</em></h2><p>Recipes, ingredient guides, and stories from the people behind the bazar will appear here as they are published.</p><Link className="button button-green" href="/shop">Explore the bazar <ArrowRight size={16} /></Link></div><div className="blog-empty-links"><span>WHILE YOU WAIT</span><Link href="/food-stories">Watch our food stories <ArrowRight size={15} /></Link><Link href="/our-story">Meet the bazar <ArrowRight size={15} /></Link></div></section>}</main>;
}
