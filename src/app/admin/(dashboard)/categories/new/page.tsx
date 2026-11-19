import type { Metadata } from "next";
import { requireAdmin } from "@/lib/authz";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Add Category · Admin", robots: { index: false, follow: false } };

export default async function NewCategoryPage() {
  await requireAdmin("categories.manage");
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCE / MARKET STRUCTURE</span><h1>Add category</h1></div></div><CategoryForm /></div>;
}
