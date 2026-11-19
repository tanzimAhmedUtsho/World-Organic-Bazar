import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { AddressBook, PasswordEditor, ProfileEditor, SignOutButton } from "@/components/layout/account-tools";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "আপনার অ্যাকাউন্ট", robots: { index: false, follow: false } };
const statusBn: Record<string, string> = { PENDING: "অপেক্ষমাণ", CONFIRMED: "নিশ্চিত", PROCESSING: "প্রস্তুত হচ্ছে", SHIPPED: "পথে আছে", DELIVERED: "পৌঁছে গেছে", CANCELLED: "বাতিল", RETURNED: "ফেরত" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=%2Faccount");
  const [user, orders, addresses, wishlist] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, phone: true } }),
    prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, _count: { select: { items: true } } } }),
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    prisma.wishlist.findUnique({ where: { userId: session.user.id }, select: { _count: { select: { items: true } } } }),
  ]);
  if (!user) redirect("/account/login");
  const serializedAddresses = addresses.map((address) => ({ ...address, label: address.label ?? undefined, instructions: address.instructions ?? undefined, createdAt: address.createdAt.toISOString() }));
  return <main className="account-page"><div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>আপনার অ্যাকাউন্ট</span></div><div className="account-heading"><div><span className="eyebrow">বাজারে আপনার অ্যাকাউন্ট</span><h1>স্বাগতম, <em>{user.name?.split(" ")[0] || "আপনি"}।</em></h1><p>{user.email}</p></div><SignOutButton /></div><div className="account-summary"><Link href="/account/orders" className="account-summary-card"><Package /><span><strong>{orders.length.toLocaleString("bn-BD")}</strong> সাম্প্রতিক অর্ডার</span><ArrowRight size={14} /></Link><Link href="/wishlist" className="account-summary-card"><ShieldCheck /><span><strong>{(wishlist?._count.items ?? 0).toLocaleString("bn-BD")}</strong> পছন্দের পণ্য</span><ArrowRight size={14} /></Link></div><div className="account-grid"><section className="account-section"><div className="account-section-heading"><div><span className="eyebrow">প্রোফাইল</span><h2>আপনার তথ্য</h2></div></div><ProfileEditor name={user.name ?? ""} phone={user.phone ?? ""} /><div className="account-divider" /><span className="eyebrow">পাসওয়ার্ড</span><h3>অ্যাকাউন্ট নিরাপদ রাখুন</h3><PasswordEditor /></section><section className="account-section"><div className="account-section-heading"><div><span className="eyebrow">ডেলিভারি</span><h2>আপনার ঠিকানা</h2></div></div><AddressBook initialAddresses={serializedAddresses} /></section></div><section className="account-section recent-orders"><div className="account-section-heading"><div><span className="eyebrow">সাম্প্রতিক কার্যক্রম</span><h2>আপনার অর্ডার</h2></div><Link href="/account/orders" className="text-link">সব অর্ডার <ArrowRight size={14} /></Link></div>{orders.length ? <div className="account-order-list">{orders.map((order) => <Link href={`/account/orders/${order.id}`} className="account-order-row" key={order.id}><div><span>{order.orderNumber}</span><small>{new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" }).format(order.createdAt)} · {order._count.items.toLocaleString("bn-BD")}টি পণ্য</small></div><span className={`status-pill status-${order.status.toLowerCase()}`}>{statusBn[order.status] || order.status}</span><strong>{formatBDT(Number(order.total))}</strong><ArrowRight size={14} /></Link>)}</div> : <div className="account-empty"><p>আপনি এখনো কোনো অর্ডার করেননি।</p><Link className="text-link" href="/shop">বাজার ঘুরে দেখুন →</Link></div>}</section></main>;
}
