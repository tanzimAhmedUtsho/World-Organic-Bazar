import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Category · Admin", robots: { index: false, follow: false } };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("categories.manage");
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();
  const initial = { nameEn: category.nameEn, nameBn: category.nameBn, slug: category.slug, description: category.description ?? "", imageUrl: category.imageUrl ?? "", displayOrder: category.displayOrder, active: category.active, seoTitle: category.seoTitle ?? "", seoDescription: category.seoDescription ?? "" };
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCE / MARKET STRUCTURE</span><h1>Edit category</h1><p>{category.nameEn}</p></div></div><CategoryForm initial={initial} categoryId={category.id} /></div>;
}
