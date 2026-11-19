"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import type { StoreProduct } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";

export function ProductDetailActions({ product }: { product: StoreProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const { add } = useCart();
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
  async function addToBasket() {
    if (!variant) return;
    setAdding(true);
    setMessage("");
    try {
      await add(product, variant.id, quantity);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    } catch {
      setMessage("এই মুহূর্তে পণ্যটি ব্যাগে যোগ করা যাচ্ছে না। আবার চেষ্টা করুন।");
    } finally {
      setAdding(false);
    }
  }
  return <div className="detail-actions-wrap">
    <label className="detail-variant"><span>ওজন বেছে নিন</span><select value={variantId} onChange={(event) => setVariantId(event.target.value)} aria-label={`${product.name}-এর ওজন বেছে নিন`}>{product.variants.map((item) => <option key={item.id} value={item.id} disabled={item.stockQuantity < 1}>{item.label}{item.stockQuantity < 1 ? " · স্টকে নেই" : ""}</option>)}</select></label>
    {variant && <p className="detail-stock">{variant.stockQuantity > 0 ? `${variant.stockQuantity.toLocaleString("bn-BD")}টি মজুত আছে` : "এই মুহূর্তে মজুত নেই"}</p>}
    <div className="detail-actions"><div className="quantity-control"><button aria-label="পরিমাণ কমান" onClick={() => setQuantity((n) => Math.max(1, n - 1))}><Minus size={15} /></button><span>{quantity.toLocaleString("bn-BD")}</span><button aria-label="পরিমাণ বাড়ান" disabled={!variant || quantity >= variant.stockQuantity} onClick={() => setQuantity((n) => Math.min(variant?.stockQuantity ?? n, n + 1))}><Plus size={15} /></button></div><button className="button button-green detail-add" disabled={!variant || variant.stockQuantity < 1 || adding} onClick={() => void addToBasket()}>{added ? <>ব্যাগে যোগ হয়েছে <Check size={16} /></> : <>{adding ? "যোগ হচ্ছে…" : "ব্যাগে রাখুন"} <ArrowRight size={16} /></>}</button>{added && <Link href="/cart" className="added-link">ব্যাগ দেখুন →</Link>}</div>
    {message && <p className="product-feedback" role="alert">{message}</p>}
  </div>;
}
