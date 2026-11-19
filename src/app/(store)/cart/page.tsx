"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";

export default function CartPage() {
  const { lines, count, subtotal, loading, error, setQuantity, remove } = useCart();
  const [lineError, setLineError] = useState("");
  async function changeQuantity(lineId: string, change: () => Promise<void>) {
    setLineError("");
    try { await change(); } catch { setLineError("ব্যাগ আপডেট করা যায়নি। আবার চেষ্টা করুন।"); }
  }
  return <main className="basket-page"><div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>আপনার ব্যাগ</span></div><div className="basket-heading"><div><span className="eyebrow">পছন্দের খাবার একসঙ্গে</span><h1>আপনার ব্যাগ<span>({count.toLocaleString("bn-BD")})</span></h1></div><Link href="/shop" className="text-link">আরও পণ্য দেখুন <ArrowRight size={15} /></Link></div>
    {loading ? <div className="basket-empty" aria-live="polite"><span className="eyebrow">ব্যাগ লোড হচ্ছে</span><div className="loading-line" /></div> : error ? <div className="basket-empty"><h2>ব্যাগ খোলা যাচ্ছে না।</h2><p>ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।</p><button className="button button-green" onClick={() => window.location.reload()}>আবার চেষ্টা করুন</button></div> : lines.length === 0 ? <div className="basket-empty"><span className="basket-empty-icon"><ShoppingBasket /></span><h2>আপনার ব্যাগ এখনো খালি।</h2><p>বাজারে আপনার পছন্দের খাবারগুলো অপেক্ষা করছে।</p><Link className="button button-green" href="/shop">পণ্য দেখুন <ArrowRight size={16} /></Link></div> : <div className="basket-layout"><div className="basket-lines">{lineError && <p className="product-feedback" role="alert">{lineError}</p>}{lines.map((line) => <article key={line.id} className="basket-line"><Link href={`/product/${line.product.slug}`} className="basket-thumb"><Image src={line.product.image} alt={line.product.name} fill sizes="100px" /></Link><div className="basket-item-copy"><span>{line.product.category}</span><Link href={`/product/${line.product.slug}`}>{line.product.name}</Link><small>{line.variant.label} · {formatPrice(line.variant.price)} প্রতি পিস</small><button className="remove-item" onClick={() => void changeQuantity(line.id, () => remove(line.id))}><Trash2 size={13} /> সরিয়ে ফেলুন</button></div><div className="quantity-control basket-quantity"><button aria-label={`${line.product.name} একটি কমান`} disabled={line.quantity <= 1} onClick={() => void changeQuantity(line.id, () => setQuantity(line, line.quantity - 1))}><Minus size={13} /></button><span>{line.quantity.toLocaleString("bn-BD")}</span><button aria-label={`${line.product.name} একটি বাড়ান`} disabled={line.quantity >= line.variant.stockQuantity} onClick={() => void changeQuantity(line.id, () => setQuantity(line, line.quantity + 1))}><Plus size={13} /></button></div><strong className="basket-line-price">{formatPrice(line.variant.price * line.quantity)}</strong></article>)}</div><aside className="order-summary"><span className="eyebrow">অর্ডারের সারাংশ</span><div><span>পণ্যের মোট দাম</span><strong>{formatPrice(subtotal)}</strong></div><p className="delivery-hint">ডেলিভারি চার্জ আপনার জেলা অনুযায়ী হবে; অর্ডারের আগে দেখানো হবে।</p><Link className="button button-green checkout-button" href="/checkout">অর্ডার সম্পন্ন করুন <ArrowRight size={16} /></Link><small>সেবা চালু আছে এমন এলাকায় ক্যাশ অন ডেলিভারি পাওয়া যায়।</small></aside></div>}
  </main>;
}
