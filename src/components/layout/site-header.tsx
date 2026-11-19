"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBasket, UserRound, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { displayText } from "@/lib/display-text";

const defaultAnnouncement = "বাংলার ঐতিহ্যবাহী খাবার, যত্নে বাছাই করা";

export function SiteHeader({ announcement = defaultAnnouncement }: { announcement?: string }) {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  return <>
    <div className="announcement"><span>{displayText(announcement, defaultAnnouncement)}</span><span className="announcement-note">বাংলাদেশের খাঁটি খাবার</span></div>
    <header className="site-header">
      <button className="icon-button mobile-menu" aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <Link href="/" className="brand" aria-label="World অর্গানিক বাজার — হোম"><BrandLogo /></Link>
      <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="প্রধান নেভিগেশন"><Link href="/">হোম</Link><Link href="/shop">পণ্য</Link><Link href="/shop">বিভাগ</Link><Link href="/our-story">আমাদের গল্প</Link><Link href="/food-stories">খাদ্যগল্প</Link><Link href="/blog">রেসিপি</Link><Link href="/contact">যোগাযোগ</Link></nav>
      <div className="header-actions"><button className="icon-button search-toggle" aria-label="পণ্য খুঁজুন" onClick={() => setSearchOpen(!searchOpen)}><Search /></button><Link href="/wishlist" className="icon-button wishlist-shortcut" aria-label="পছন্দের পণ্য"><Heart /></Link><Link href="/account" className="icon-button account-shortcut" aria-label="আপনার অ্যাকাউন্ট"><UserRound /></Link><Link href="/cart" className="basket-button" aria-label={`শপিং ব্যাগ, ${count}টি পণ্য`}><ShoppingBasket /><span>ব্যাগ</span><b>{count}</b></Link></div>
    </header>
    {searchOpen && <form className="search-bar" action="/shop"><Search size={18} /><input name="q" autoFocus placeholder="আপনার পছন্দের খাবার খুঁজুন" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" className="icon-button" aria-label="খোঁজ বন্ধ করুন" onClick={() => setSearchOpen(false)}><X size={18} /></button><button className="search-submit">খুঁজুন</button></form>}
  </>;
}
