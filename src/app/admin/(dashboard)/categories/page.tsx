import Link from "next/link";
import { ArrowRight, FolderOpen, Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { CategoryStatusButton } from "@/components/admin/category-status-button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const admin = await requireAdmin("categories.read");
  const canManage = admin.adminRoles.some(({ role }) => role.name === "SUPER_ADMIN" || role.permissions.some(({ permission }) => permission.key === "categories.manage"));
  const query = await searchParams;
  const search = query.q?.trim().slice(0, 100);
  const active = query.status === "active" ? true : query.status === "inactive" ? false : undefined;
  const where = { ...(active !== undefined ? { active } : {}), ...(search ? { OR: [{ nameEn: { contains: search, mode: "insensitive" as const } }, { nameBn: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const categories = await prisma.category.findMany({ where, orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }], include: { _count: { select: { products: true, children: true } } } });
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCE / MARKET STRUCTURE</span><h1>Categories</h1><p>Organize the foods and flavours customers can discover.</p></div>{canManage && <Link href="/admin/categories/new" className="admin-primary-button"><Plus size={14} /> Add category</Link>}</div><section className="admin-panel admin-list-panel"><form className="admin-list-toolbar"><label className="admin-search"><Search size={15} /><input name="q" placeholder="Search categories" defaultValue={query.q} /></label><select name="status" defaultValue={query.status || ""} aria-label="Filter categories"><option value="">All categories</option><option value="active">Active</option><option value="inactive">Inactive</option></select><button className="admin-secondary-button">Filter</button><span className="admin-result-count">{categories.length} categories</span></form><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>CATEGORY</th><th>SLUG</th><th>PRODUCTS</th><th>SUBCATEGORIES</th><th>STATUS</th><th></th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><div className="admin-product-name"><strong>{category.nameEn}</strong><small lang="bn">{category.nameBn}</small></div></td><td>/{category.slug}</td><td>{category._count.products}</td><td>{category._count.children}</td><td><span className={`admin-status ${category.active ? "admin-status-active" : "admin-status-draft"}`}>{category.active ? "active" : "inactive"}</span></td><td><div className="admin-row-actions">{canManage && <Link href={`/admin/categories/${category.id}/edit`} className="admin-secondary-button compact">Edit</Link>}{canManage && <CategoryStatusButton id={category.id} active={category.active} name={category.nameEn} />}</div></td></tr>)}{categories.length === 0 && <tr><td colSpan={6}><div className="admin-empty"><FolderOpen size={20} /><p>No categories match this filter.</p><Link href="/admin/categories/new">Add the first category <ArrowRight size={13} /></Link></div></td></tr>}</tbody></table></div></section></div>;
}
