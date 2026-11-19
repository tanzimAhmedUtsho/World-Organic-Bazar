import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "অর্ডার সম্পন্ন করুন", description: "ডেলিভারির তথ্য দিয়ে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।" };

export default async function CheckoutPage() {
  const zones = await prisma.shippingZone.findMany({ where: { active: true }, orderBy: { district: "asc" } });
  return <main className="basket-page checkout-page"><div className="breadcrumb"><a href="/">হোম</a><span>/</span><a href="/cart">আপনার ব্যাগ</a><span>/</span><span>অর্ডার</span></div><div className="basket-heading"><div><span className="eyebrow">আর কয়েকটি তথ্য, তারপর অর্ডার সম্পন্ন</span><h1>অর্ডার সম্পন্ন করুন</h1></div><a href="/cart" className="text-link">← ব্যাগে ফিরুন</a></div><CheckoutForm zones={zones.map((zone) => ({ district: zone.district, deliveryFee: Number(zone.deliveryFee), freeThreshold: zone.freeThreshold ? Number(zone.freeThreshold) : null, estimatedDays: zone.estimatedDays, demo: zone.demo }))} /></main>;
}
