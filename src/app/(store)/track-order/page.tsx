import type { Metadata } from "next";
import { OrderTracker } from "@/components/cart/order-tracker";

export const metadata: Metadata = { title: "অর্ডার ট্র্যাক করুন", description: "অর্ডার নম্বর ও ফোন দিয়ে অর্ডারের অবস্থা জানুন।" };

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order = "" } = await searchParams;
  return <main className="basket-page tracking-page"><div className="breadcrumb"><a href="/">হোম</a><span>/</span><span>অর্ডার ট্র্যাক</span></div><div className="basket-heading"><div><span className="eyebrow">অর্ডারের অবস্থা দেখে নিন</span><h1>অর্ডার ট্র্যাক করুন</h1></div></div><OrderTracker initialOrder={order} /></main>;
}
