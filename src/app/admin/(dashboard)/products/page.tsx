import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { ArchiveProductButton } from "@/components/admin/archive-product-button";

export const dynamic = "force-dynamic";
const pageSize = 20;

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const admin = await requireAdmin("products.read");
  const canManage = admin.adminRoles.some(({ role }) => role.name === "SUPER_ADMIN" || role.permissions.some(({ permission }) => permission.key === "products.manage"));
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const search = query.q?.trim().slice(0, 100);
  const status = ["DRAFT", "ACTIVE", "ARCHIVED"].includes(query.status || "") ? query.status as "DRAFT" | "ACTIVE" | "ARCHIVED" : undefined;
  const where = { ...(status ? { status } : {}), ...(search ? { OR: [{ nameEn: { contains: search, mode: "insensitive" as const } }, { nameBn: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: [{ updatedAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize, include: { variants: { where: { active: true }, orderBy: { price: "asc" } }, categories: { include: { category: { select: { nameEn: true } } } } } }),
    prisma.product.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCE / CATALOG</span><h1>Products</h1><p>Manage product information, variation pricing, and availability.</p></div>{canManage && <Link href="/admin/products/new" className="admin-primary-button"><Plus size={14} /> Add product</Link>}</div>
    <section className="admin-panel admin-list-panel"><form className="admin-list-toolbar"><label className="admin-search"><Search size={15} /><input name="q" placeholder="Search name or slug" defaultValue={query.q} /></label><select name="status" defaultValue={status || ""} aria-label="Filter by status"><option value="">All statuses</option><option value="ACTIVE">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></select><button className="admin-secondary-button">Filter</button><span className="admin-result-count">{total} products</span></form><div className="admin-table-scroll"><table className="admin-table product-admin-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE FROM</th><th>STOCK</th><th>STATUS</th><th>UPDATED</th><th></th></tr></thead><tbody>{products.map((product) => { const totalStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0); const lowest = product.variants[0]; return <tr key={product.id}><td><div className="admin-product-name"><strong>{product.nameEn}</strong><small lang="bn">{product.nameBn} · {product.variants.length} variations</small></div></td><td>{product.categories.map((item) => item.category.nameEn).join(", ") || "—"}</td><td>{lowest ? formatBDT(Number(lowest.price)) : "—"}</td><td><span className={totalStock < 6 ? "stock-indicator low" : "stock-indicator"}>{totalStock}</span></td><td><span className={`admin-status admin-status-${product.status.toLowerCase()}`}>{product.status.toLowerCase()}</span></td><td>{new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(product.updatedAt)}</td><td><div className="admin-row-actions">{canManage && <Link className="admin-secondary-button compact" href={`/admin/products/${product.id}/edit`}>Edit</Link>}{product.status !== "ARCHIVED" && canManage && <ArchiveProductButton productId={product.id} productName={product.nameEn} />}</div></td></tr>; })}{products.length === 0 && <tr><td colSpan={7}><div className="admin-empty">No products match this filter.</div></td></tr>}</tbody></table></div>{pages > 1 && <div className="admin-pagination">{page > 1 && <Link href={listHref(page - 1, query.q, status)}><ArrowLeft size={13} /> Previous</Link>}<span>Page {page} of {pages}</span>{page < pages && <Link href={listHref(page + 1, query.q, status)}>Next <ArrowRight size={13} /></Link>}</div>}</section>
  </div>;
}

function listHref(page: number, q?: string, status?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  return `/admin/products?${params.toString()}`;
}
