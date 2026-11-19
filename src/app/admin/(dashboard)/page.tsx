import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Clock3, Package, ShoppingBag, Users, Wallet } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";

export const metadata = { title: "Dashboard · Admin", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  await requireAdmin("dashboard.read");
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);
  const [orders, revenue, products, customers, pendingOrders, lowStock, recentOrders, statusStats, monthly, bestSellerRows] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { adminRoles: { none: {} } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.productVariant.count({ where: { active: true, stockQuantity: { lte: 5 } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 7, select: { id: true, orderNumber: true, customerName: true, customerPhone: true, total: true, status: true, paymentStatus: true, createdAt: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.$queryRaw<Array<{ month: Date; total: Prisma.Decimal }>>(Prisma.sql`SELECT date_trunc('month', "createdAt") AS month, COALESCE(SUM("total"), 0) AS total FROM "Order" WHERE "paymentStatus" = 'PAID' AND "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`),
    prisma.orderItem.groupBy({ by: ["productId"], where: { productId: { not: null }, order: { status: { notIn: ["CANCELLED", "RETURNED"] } } }, _sum: { quantity: true, lineTotal: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
  ]);
  const bestIds = bestSellerRows.flatMap((item) => item.productId ? [item.productId] : []);
  const bestProducts = await prisma.product.findMany({ where: { id: { in: bestIds } }, select: { id: true, nameEn: true, nameBn: true } });
  const productMap = new Map(bestProducts.map((product) => [product.id, product]));
  const monthMap = new Map(monthly.map((item) => [`${item.month.getFullYear()}-${item.month.getMonth()}`, Number(item.total)]));
  const chart = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return { label: new Intl.DateTimeFormat("en", { month: "short" }).format(date), total: monthMap.get(`${date.getFullYear()}-${date.getMonth()}`) ?? 0 };
  });
  const maxRevenue = Math.max(1, ...chart.map((item) => item.total));
  const statuses = new Map(statusStats.map((item) => [item.status, item._count._all]));

  return <div className="admin-dashboard"><div className="admin-page-heading"><div><span className="admin-eyebrow">MARKET AT A GLANCE</span><h1>Good morning.</h1><p>Here’s what is happening at World Organic Bazar today.</p></div><div className="admin-date-stamp"><Clock3 size={14} />{new Intl.DateTimeFormat("en-BD", { dateStyle: "full" }).format(new Date())}</div></div>
    <section className="admin-stat-grid"><StatCard label="Paid revenue" value={formatBDT(Number(revenue._sum.total ?? 0))} icon={<Wallet />} note="Confirmed payments" /><StatCard label="Orders" value={orders.toLocaleString("en-BD")} icon={<ShoppingBag />} note={`${pendingOrders} need attention`} tone={pendingOrders ? "amber" : undefined} /><StatCard label="Active products" value={products.toLocaleString("en-BD")} icon={<Package />} note={lowStock ? `${lowStock} variants are low in stock` : "No low-stock variants"} tone={lowStock ? "amber" : undefined} /><StatCard label="Customers" value={customers.toLocaleString("en-BD")} icon={<Users />} note="Registered accounts" /></section>
    <section className="admin-dashboard-grid"><article className="admin-panel revenue-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">PAID ORDERS</span><h2>Revenue over time</h2></div><span className="admin-period">LAST 6 MONTHS</span></div><div className="revenue-chart" role="img" aria-label="Monthly paid revenue over the last six months">{chart.map((item) => <div className="revenue-column" key={item.label}><span className="revenue-bar-value">{item.total ? formatBDT(item.total) : "—"}</span><div className="revenue-bar-track"><span style={{ height: `${Math.max(3, item.total / maxRevenue * 100)}%` }} /></div><span className="revenue-month">{item.label}</span></div>)}</div><div className="chart-footnote">Revenue includes orders marked paid by an administrator or verified payment provider.</div></article>
      <article className="admin-panel order-stats-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">ORDER FLOW</span><h2>Order status</h2></div><Link href="/admin/orders" className="admin-panel-link">View orders <ArrowRight size={13} /></Link></div><div className="status-stat-list">{["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => <div className="status-stat-row" key={status}><span className={`status-indicator status-indicator-${status.toLowerCase()}`} /><span>{status.toLowerCase()}</span><strong>{(statuses.get(status as never) ?? 0).toLocaleString("en-BD")}</strong></div>)}</div></article></section>
    <section className="admin-dashboard-grid lower-dashboard-grid"><article className="admin-panel recent-orders-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">LATEST ACTIVITY</span><h2>Recent orders</h2></div><Link href="/admin/orders" className="admin-panel-link">All orders <ArrowRight size={13} /></Link></div>{recentOrders.length ? <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong><small>{new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(order.createdAt)}</small></td><td><span>{order.customerName}</span><small>{order.customerPhone}</small></td><td>{formatBDT(Number(order.total))}</td><td><span className={`admin-status admin-status-${order.status.toLowerCase()}`}>{order.status.toLowerCase()}</span></td><td><Link href={`/admin/orders/${order.id}`} className="admin-row-action" aria-label={`Open ${order.orderNumber}`}><ArrowUpRight size={15} /></Link></td></tr>)}</tbody></table></div> : <div className="admin-empty">No orders have been placed yet.</div>}</article>
      <article className="admin-panel best-sellers-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">PRODUCT PERFORMANCE</span><h2>Best sellers</h2></div><Link href="/admin/products" className="admin-panel-link">Catalog <ArrowRight size={13} /></Link></div>{bestSellerRows.length ? <div className="best-seller-list">{bestSellerRows.map((row, index) => { const product = row.productId ? productMap.get(row.productId) : null; return <div className="best-seller-row" key={row.productId ?? index}><span className="best-seller-rank">0{index + 1}</span><span className="best-seller-name"><strong>{product?.nameEn ?? "Removed product"}</strong>{product?.nameBn && <small lang="bn">{product.nameBn}</small>}</span><span className="best-seller-qty">{row._sum.quantity ?? 0}<small>sold</small></span></div>; })}</div> : <div className="admin-empty">Sales performance will appear after orders are fulfilled.</div>}</article></section>
  </div>;
}

function StatCard({ label, value, icon, note, tone }: { label: string; value: string; icon: React.ReactNode; note: string; tone?: "amber" }) {
  return <article className={`admin-stat-card ${tone === "amber" ? "stat-attention" : ""}`}><div className="admin-stat-top"><span>{label}</span><span className="admin-stat-icon">{icon}</span></div><strong>{value}</strong><small>{tone === "amber" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}{note}</small></article>;
}
