import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/cart/wishlist-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";
import { storeContactInfo } from "@/lib/contact-info";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [announcementSection, footerSection] = await Promise.all([
    prisma.homepageSection.findUnique({ where: { key: "announcement" } }),
    prisma.homepageSection.findUnique({ where: { key: "footer" } }),
  ]);
  const announcement = announcementSection?.content as { message?: string } | undefined;
  const footer = footerSection?.content as { email?: string; social?: { facebook?: string; instagram?: string; youtube?: string } } | undefined;
  return <CartProvider><WishlistProvider><div className="site-shell"><SiteHeader announcement={announcement?.message} />{children}<footer className="site-footer"><div className="footer-top"><div className="footer-brand"><Link href="/" className="brand"><BrandLogo variant="footer" /></Link><p>বাংলার খাঁটি খাবার, যত্নে বাছাই করা।<br />ঐতিহ্যের স্বাদ পৌঁছে যাক আপনার টেবিলে।</p><small>{storeContactInfo.address}</small></div><div className="footer-links"><div><span className="footer-label">ঘুরে দেখুন</span><Link href="/shop">সব পণ্য</Link><Link href="/our-story">আমাদের গল্প</Link><Link href="/food-stories">খাদ্যগল্প</Link><Link href="/blog">ব্লগ ও রেসিপি</Link><Link href="/contact">যোগাযোগ</Link></div><div><span className="footer-label">সহায়তা</span><Link href="/track-order">অর্ডার ট্র্যাক করুন</Link><Link href="/account">আপনার অ্যাকাউন্ট</Link><Link href="/privacy-policy">গোপনীয়তা নীতি</Link><Link href="/terms-and-conditions">শর্তাবলি</Link><a href={`tel:${storeContactInfo.phone}`}>{storeContactInfo.phone}</a>{footer?.email && <a href={`mailto:${footer.email}`}>{footer.email}</a>}</div></div><div className="footer-note"><span className="eyebrow">প্রতিদিন একটু ভালো</span><p>খাবারের গল্প, নতুন পণ্য আর মৌসুমি খবর থাকুক আপনার ইনবক্সে।</p><Link href="/shop" className="footer-signup">বাজার ঘুরে দেখুন <span>→</span></Link><div className="footer-social">{footer?.social?.facebook && <a href={footer.social.facebook} target="_blank" rel="noreferrer">Facebook</a>}{footer?.social?.instagram && <a href={footer.social.instagram} target="_blank" rel="noreferrer">Instagram</a>}{footer?.social?.youtube && <a href={footer.social.youtube} target="_blank" rel="noreferrer">YouTube</a>}</div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} World অর্গানিক বাজার</span><span>বাংলাদেশের ঐতিহ্যবাহী খাবার</span><span>গোপনীয়তা · শর্তাবলি</span></div></footer><a className="whatsapp-shortcut" href={`https://wa.me/${storeContactInfo.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp-এ যোগাযোগ করুন"><MessageCircle aria-hidden="true" /><span>WhatsApp</span></a></div></WishlistProvider></CartProvider>;
}
