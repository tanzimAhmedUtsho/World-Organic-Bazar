"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/commerce";

export type ShippingZoneChoice = { district: string; deliveryFee: number; freeThreshold: number | null; estimatedDays: string | null; demo: boolean };

export function CheckoutForm({ zones }: { zones: ShippingZoneChoice[] }) {
  const router = useRouter();
  const { lines, subtotal, loading, refresh } = useCart();
  const [serverError, setServerError] = useState("");
  const form = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema), defaultValues: { customerName: "", customerPhone: "", customerEmail: "", district: "", upazila: "", addressLine: "", deliveryInstructions: "", paymentMethod: "COD", couponCode: "" } });
  const selectedDistrict = useWatch({ control: form.control, name: "district" });
  const selectedZone = zones.find((zone) => zone.district === selectedDistrict);
  const deliveryFee = selectedZone ? (selectedZone.freeThreshold !== null && subtotal >= selectedZone.freeThreshold ? 0 : selectedZone.deliveryFee) : null;
  const inputClass = (name: keyof CheckoutInput) => form.formState.errors[name] ? "checkout-input invalid" : "checkout-input";

  async function placeOrder(values: CheckoutInput) {
    setServerError("");
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "অর্ডার সম্পন্ন করা যায়নি।");
      await refresh();
      router.push(`/track-order?order=${encodeURIComponent(result.orderNumber)}`);
      router.refresh();
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  if (loading) return <div className="checkout-empty">আপনার ব্যাগ লোড হচ্ছে…</div>;
  if (!lines.length) return <div className="checkout-empty"><h2>আপনার ব্যাগ খালি।</h2><p>অর্ডার করার আগে বাজার থেকে পণ্য বেছে নিন।</p><a href="/shop" className="button button-green">পণ্য দেখুন <ArrowRight size={16} /></a></div>;

  return <form className="checkout-layout" onSubmit={form.handleSubmit(placeOrder)} noValidate>
    <div className="checkout-fields">
      <section className="checkout-panel"><span className="eyebrow">০১ / ক্রেতার তথ্য</span><div className="checkout-field-grid"><label className="checkout-field"><span>আপনার নাম</span><input className={inputClass("customerName")} autoComplete="name" {...form.register("customerName")} />{form.formState.errors.customerName && <small>{form.formState.errors.customerName.message}</small>}</label><label className="checkout-field"><span>মোবাইল নম্বর</span><input className={inputClass("customerPhone")} type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...form.register("customerPhone")} />{form.formState.errors.customerPhone && <small>{form.formState.errors.customerPhone.message}</small>}</label><label className="checkout-field field-full"><span>ইমেইল <em>ঐচ্ছিক</em></span><input className={inputClass("customerEmail")} type="email" autoComplete="email" {...form.register("customerEmail")} />{form.formState.errors.customerEmail && <small>{form.formState.errors.customerEmail.message}</small>}</label></div></section>
      <section className="checkout-panel"><span className="eyebrow">০২ / ডেলিভারির ঠিকানা</span>{zones.length === 0 ? <div className="no-shipping"><h3>ডেলিভারি এলাকা এখনো সেট করা হয়নি।</h3><p>অর্ডার করার আগে অনুগ্রহ করে আমাদের সঙ্গে যোগাযোগ করুন।</p><a href="/contact" className="text-link">যোগাযোগ করুন →</a></div> : <div className="checkout-field-grid"><label className="checkout-field"><span>জেলা</span><select className={inputClass("district")} autoComplete="address-level1" {...form.register("district")}><option value="">জেলা বেছে নিন</option>{zones.map((zone) => <option value={zone.district} key={zone.district}>{zone.district}</option>)}</select>{form.formState.errors.district && <small>{form.formState.errors.district.message}</small>}</label><label className="checkout-field"><span>উপজেলা / এলাকা</span><input className={inputClass("upazila")} autoComplete="address-level2" {...form.register("upazila")} />{form.formState.errors.upazila && <small>{form.formState.errors.upazila.message}</small>}</label><label className="checkout-field field-full"><span>সম্পূর্ণ ঠিকানা</span><textarea className={inputClass("addressLine")} rows={3} autoComplete="street-address" {...form.register("addressLine")} />{form.formState.errors.addressLine && <small>{form.formState.errors.addressLine.message}</small>}</label><label className="checkout-field field-full"><span>ডেলিভারির নির্দেশনা <em>ঐচ্ছিক</em></span><textarea className={inputClass("deliveryInstructions")} rows={2} {...form.register("deliveryInstructions")} /></label></div>}</section>
      <section className="checkout-panel"><span className="eyebrow">০৩ / পেমেন্ট</span><label className="payment-choice"><input type="radio" value="COD" checked readOnly /><span><strong>ক্যাশ অন ডেলিভারি</strong><small>পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</small></span><span className="payment-tag">চালু আছে</span></label><p className="payment-note">অনলাইন পেমেন্ট যাচাই-সহ চালু হলে এখানে দেখানো হবে।</p></section>
      <details className="checkout-coupon"><summary>কুপন কোড আছে?</summary><label className="checkout-field coupon-field"><span>কুপন কোড <em>ঐচ্ছিক</em></span><input className={inputClass("couponCode")} autoCapitalize="characters" {...form.register("couponCode")} /><small>অর্ডারের সময় কুপনের যোগ্যতা যাচাই হবে।</small></label></details>
      {serverError && <p className="checkout-error" role="alert">{serverError}</p>}
      <button className="button button-green place-order-button" disabled={form.formState.isSubmitting || zones.length === 0}>{form.formState.isSubmitting ? "অর্ডার হচ্ছে…" : "ক্যাশ অন ডেলিভারিতে অর্ডার করুন"}<ArrowRight size={16} /></button>
      <p className="secure-note"><LockKeyhole size={13} /> আপনার তথ্য শুধু অর্ডার সম্পন্ন ও সহায়তার জন্য ব্যবহার হবে।</p>
    </div>
    <aside className="order-summary checkout-summary"><span className="eyebrow">অর্ডারের সারাংশ</span>{lines.map((line) => <div className="checkout-summary-line" key={line.id}><span>{line.quantity.toLocaleString("bn-BD")} × {line.product.name} <small>{line.variant.label}</small></span><strong>{formatPrice(line.variant.price * line.quantity)}</strong></div>)}<div><span>পণ্যের মোট দাম</span><strong>{formatPrice(subtotal)}</strong></div><div><span>ডেলিভারি</span><strong>{deliveryFee === null ? "জেলা বেছে নিন" : deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}</strong></div>{selectedZone?.demo && <p className="demo-rate-note">এটি নমুনা ডেলিভারি চার্জ; চালুর আগে প্রকৃত চার্জ নিশ্চিত করুন।</p>}{selectedZone?.estimatedDays && <p className="delivery-hint">সম্ভাব্য ডেলিভারি: {selectedZone.estimatedDays}</p>}<div className="summary-total"><span>কুপনের আগের মোট</span><strong>{formatPrice(subtotal + (deliveryFee ?? 0))}</strong></div></aside>
  </form>;
}
