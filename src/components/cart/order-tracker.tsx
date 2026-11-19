"use client";

import { useState, type FormEvent } from "react";
import { Check, Circle, PackageCheck, Search } from "lucide-react";

type TrackingResult = { orderNumber: string; status: string; paymentStatus: string; createdAt: string; timeline: { status: string; note: string | null; createdAt: string }[] };
const progress = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const labels: Record<string, string> = { PENDING: "অপেক্ষমাণ", CONFIRMED: "নিশ্চিত হয়েছে", PROCESSING: "প্রস্তুত হচ্ছে", SHIPPED: "পথে আছে", DELIVERED: "পৌঁছে গেছে", CANCELLED: "বাতিল", RETURNED: "ফেরত" };

export function OrderTracker({ initialOrder = "" }: { initialOrder?: string }) {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setResult(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber: form.get("orderNumber"), phone: form.get("phone") }) });
      const data = await response.json();
      if (!response.ok) throw new Error("অর্ডারটি খুঁজে পাওয়া যায়নি। অর্ডার নম্বর ও ফোন নম্বর মিলিয়ে আবার চেষ্টা করুন।");
      setResult(data as TrackingResult);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "অর্ডার খুঁজে দেখা যায়নি। আবার চেষ্টা করুন।"); }
    finally { setPending(false); }
  }
  const currentIndex = result ? progress.indexOf(result.status) : -1;
  return <div className="tracking-wrap"><form className="tracking-form" onSubmit={track}><label className="checkout-field"><span>অর্ডার নম্বর</span><input className="checkout-input" name="orderNumber" placeholder="WOB-YYYYMMDD-ABC123" defaultValue={initialOrder} required /></label><label className="checkout-field"><span>অর্ডারে দেওয়া ফোন নম্বর</span><input className="checkout-input" name="phone" type="tel" placeholder="01XXXXXXXXX" required /></label><button className="button button-green" disabled={pending}>{pending ? "খোঁজা হচ্ছে…" : "অর্ডার দেখুন"} <Search size={15} /></button>{error && <p className="checkout-error" role="alert">{error}</p>}</form>
    {result && <section className="tracking-result" aria-live="polite"><div className="tracking-result-heading"><span className="basket-empty-icon"><PackageCheck /></span><div><span className="eyebrow">অর্ডার {result.orderNumber}</span><h2>{labels[result.status] || result.status.toLowerCase()}</h2></div></div>{["CANCELLED", "RETURNED"].includes(result.status) ? <p className="tracking-terminal">অর্ডারটি {labels[result.status]?.toLowerCase()} হয়েছে। সহায়তা লাগলে আমাদের সঙ্গে যোগাযোগ করুন।</p> : <div className="tracking-progress">{progress.map((step, index) => <div className={`tracking-step ${index <= currentIndex ? "complete" : ""}`} key={step}><span className="tracking-step-icon">{index < currentIndex ? <Check size={13} /> : <Circle size={12} />}</span><span>{labels[step]}</span></div>)}</div>}<div className="tracking-timeline">{result.timeline.map((item, index) => <article className="timeline-item" key={`${item.status}-${index}`}><span className="timeline-dot" /><div><strong>{labels[item.status] || item.status}</strong>{item.note && <p>{item.note}</p>}<time dateTime={item.createdAt}>{new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time></div></article>)}</div><p className="tracking-payment">পেমেন্ট: <strong>{result.paymentStatus === "UNPAID" ? "বকেয়া" : result.paymentStatus === "PAID" ? "পরিশোধিত" : result.paymentStatus.toLowerCase()}</strong> · ক্যাশ অন ডেলিভারি</p></section>}
  </div>;
}
