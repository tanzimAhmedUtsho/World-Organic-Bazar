import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "অর্ডারের ইতিহাস", robots: { index: false, follow: false } };
const statusBn: Record<string, string> = { PENDING: "অপেক্ষমাণ", CONFIRMED: "নিশ্চিত", PROCESSING: "প্রস্তুত হচ্ছে", SHIPPED: "পথে আছে", DELIVERED: "পৌঁছে গেছে", CANCELLED: "বাতিল", RETURNED: "ফেরত" };

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=%2Faccount%2Forders");
  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } });
  return <main className="account-page"><div className="breadcrumb"><Link href="/account">আপনার অ্যাকাউন্ট</Link><span>/</span><span>অর্ডার</span></div><div className="account-heading"><div><span className="eyebrow">আপনার অর্ডারের তালিকা</span><h1>অর্ডারের <em>ইতিহাস।</em></h1></div><Link href="/shop" className="text-link">বাজার দেখুন <ArrowRight size={14} /></Link></div>{orders.length ? <div className="account-order-list">{orders.map((order) => <Link href={`/account/orders/${order.id}`} className="account-order-row" key={order.id}><div><span>{order.orderNumber}</span><small>{new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)} · {order._count.items.toLocaleString("bn-BD")}টি পণ্য</small></div><span className={`status-pill status-${order.status.toLowerCase()}`}>{statusBn[order.status] || order.status}</span><strong>{formatBDT(Number(order.total))}</strong><ArrowRight size={14} /></Link>)}</div> : <div className="account-empty"><p>এখনো কোনো অর্ডার নেই।</p><Link className="text-link" href="/shop">বাজার ঘুরে দেখুন →</Link></div>}</main>;
}
