import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order Details", robots: { index: false, follow: false } };

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login");
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { id, userId: session.user.id }, include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } } });
  if (!order) notFound();
  return <main className="account-page"><div className="breadcrumb"><Link href="/account/orders">ORDERS</Link><span>/</span><span>{order.orderNumber}</span></div><div className="account-heading"><div><span className="eyebrow">ORDER PLACED {new Intl.DateTimeFormat("en-BD", { dateStyle: "long" }).format(order.createdAt)}</span><h1>{order.orderNumber}</h1><p className={`status-pill status-${order.status.toLowerCase()}`}>{order.status.toLowerCase()} · {order.paymentStatus.toLowerCase()}</p></div><Link href="/account/orders" className="text-link"><ArrowLeft size={14} /> All orders</Link></div><div className="order-detail-grid"><section className="account-section"><span className="eyebrow">YOUR ITEMS</span><div className="order-detail-lines">{order.items.map((item) => <div className="order-detail-line" key={item.id}><span><strong>{item.productName}</strong><small>{item.variantLabel} · Qty {item.quantity}</small></span><strong>{formatBDT(Number(item.lineTotal))}</strong></div>)}</div><div className="summary-total"><span>Items subtotal</span><strong>{formatBDT(Number(order.subtotal))}</strong></div><div className="order-detail-line"><span>Delivery</span><strong>{formatBDT(Number(order.deliveryFee))}</strong></div>{Number(order.discountAmount) > 0 && <div className="order-detail-line"><span>Discount</span><strong>−{formatBDT(Number(order.discountAmount))}</strong></div>}<div className="summary-total"><span>Total</span><strong>{formatBDT(Number(order.total))}</strong></div></section><section className="account-section"><span className="eyebrow">DELIVERY TO</span><h3>{order.customerName}</h3><p>{order.customerPhone}<br />{order.addressLine}<br />{order.upazila}, {order.district}</p><div className="account-divider" /><span className="eyebrow">ORDER PROGRESS</span><div className="tracking-timeline">{order.statusHistory.map((item) => <article className="timeline-item" key={item.id}><span className="timeline-dot" /><div><strong>{item.status.toLowerCase()}</strong>{item.note && <p>{item.note}</p>}<time dateTime={item.createdAt.toISOString()}>{new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(item.createdAt)}</time></div></article>)}</div></section></div></main>;
}
