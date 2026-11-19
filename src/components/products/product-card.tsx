"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Heart, Plus, Star } from "lucide-react";
import { formatPrice, type StoreProduct } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/cart/wishlist-provider";

export function ProductCard({ product, index = 0 }: { product: StoreProduct; index?: number }) {
  const { add } = useCart();
  const { productIds, toggle } = useWishlist();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const selected = product.variants.find((variant) => variant.id === variantId) ?? product.variants[0];
  const saved = productIds.includes(product.id);
  async function addSelected() {
    if (!selected) return;
    setAdding(true);
    setMessage("");
    try {
      await add(product, selected.id);
      setMessage("ব্যাগে যোগ হয়েছে");
      window.setTimeout(() => setMessage(""), 2200);
    } catch {
      setMessage("পণ্যটি ব্যাগে যোগ করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setAdding(false);
    }
  }
  return <article className="product-card" style={{ animationDelay: `${index * 70}ms` }}>
    <Link href={`/product/${product.slug}`} className="product-image-wrap">
      <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" className="product-image" />
      <span className="image-index">{String(index + 1).padStart(2, "0")}</span>
      {selected?.compareAtPrice && selected.compareAtPrice > selected.price && <span className="product-badge">বিশেষ দাম</span>}
      <span className="product-image-arrow"><ArrowUpRight size={16} /></span>
    </Link>
    <div className="product-info">
      <div className="product-meta"><span>{product.category}</span>{product.rating !== null && <span className="rating"><Star size={12} fill="currentColor" /> {product.rating.toLocaleString("bn-BD", { maximumFractionDigits: 1 })}</span>}</div>
      <Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link>
      <div className="product-buy-row"><p><strong>{selected ? formatPrice(selected.price) : "—"}</strong>{selected && <span> / {selected.label}</span>}</p><button className={`wishlist-mini ${saved ? "saved" : ""}`} aria-label={saved ? `${product.name} পছন্দের তালিকা থেকে সরান` : `${product.name} পছন্দের তালিকায় রাখুন`} aria-pressed={saved} title={saved ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় রাখুন"} onClick={async () => { const issue = await toggle(product.id); if (issue) setMessage(issue); }}><Heart size={15} fill={saved ? "currentColor" : "none"} /></button></div>
      <div className="product-actions-row">{product.variants.length > 1 ? <label className="variant-select-label"><span className="sr-only">{product.name}-এর ওজন বেছে নিন</span><select aria-label={`${product.name}-এর ওজন বেছে নিন`} value={variantId} onChange={(event) => setVariantId(event.target.value)}>{product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}{variant.stockQuantity < 1 ? " · স্টকে নেই" : ""}</option>)}</select></label> : <span className="stock-note">{selected && selected.stockQuantity > 0 ? "স্টকে আছে" : "এই মুহূর্তে নেই"}</span>}<button className="add-button" disabled={!selected || selected.stockQuantity < 1 || adding} onClick={() => void addSelected()}><Plus size={16} /><span>{adding ? "যোগ হচ্ছে" : "ব্যাগে রাখুন"}</span></button></div>
      {message && <p className="product-feedback" role="status">{message}</p>}
    </div>
  </article>;
}
