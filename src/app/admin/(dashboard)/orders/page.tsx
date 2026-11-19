import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin("orders.read");
  const query = await searchParams;
  const search = query.q?.trim().slice(0, 100);
  const status = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].includes(query.status || "") ? query.status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED" : undefined;
  const where = { ...(status ? { status } : {}), ...(search ? { OR: [{ orderNumber: { contains: search, mode: "insensitive" as const } }, { customerName: { contains: search, mode: "insensitive" as const } }, { customerPhone: { contains: search } }] } : {}) };
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { items: true } } } });
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCE / FULFILMENT</span><h1>Orders</h1><p>Review customer purchases, fulfilment progress, and payment status.</p></div></div><section className="admin-panel admin-list-panel"><form className="admin-list-toolbar"><label className="admin-search"><Search size={15}/><input name="q" defaultValue={query.q} placeholder="Order number, customer, or phone" /></label><select name="status" defaultValue={status || ""} aria-label="Filter by order status"><option value="">All order statuses</option>{["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED","RETURNED"].map((item) => <option key={item}>{item}</option>)}</select><button className="admin-secondary-button">Filter</button><span className="admin-result-count">Latest {orders.length} orders</span></form><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th><th>PAYMENT</th><th>PLACED</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong></td><td><div className="admin-product-name"><strong>{order.customerName}</strong><small>{order.customerPhone}</small></div></td><td>{order._count.items}</td><td>{formatBDT(Number(order.total))}</td><td><span className={`admin-status admin-status-${order.status.toLowerCase()}`}>{order.status.toLowerCase()}</span></td><td>{order.paymentStatus.toLowerCase()}</td><td>{new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(order.createdAt)}</td><td><Link className="admin-secondary-button compact" href={`/admin/orders/${order.id}`}>Review</Link></td></tr>)}{orders.length === 0 && <tr><td colSpan={8}><div className="admin-empty">No orders match this filter.</div></td></tr>}</tbody></table></div></section></div>;
}
