import type { Metadata } from "next";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add Product · Admin", robots: { index: false, follow: false } };

export default async function NewProductPage() {
  await requireAdmin("products.manage");
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" }, select: { id: true, nameEn: true, nameBn: true } });
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCE / CATALOG</span><h1>Add a product</h1><p>New products start as drafts until you publish them.</p></div></div><ProductForm categories={categories} /></div>;
}
