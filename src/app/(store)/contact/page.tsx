import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "যোগাযোগ", description: "অর্ডার ও পণ্য সম্পর্কে World অর্গানিক বাজারের সঙ্গে যোগাযোগ করুন।" };

export default async function ContactPage() {
  const [contact, footer] = await Promise.all([prisma.siteSetting.findUnique({ where: { key: "contact" } }), prisma.homepageSection.findUnique({ where: { key: "footer" } })]);
  const setting = contact?.value as { email?: string; phone?: string; address?: string; hours?: string } | undefined;
  const footerInfo = footer?.content as { email?: string; phone?: string; address?: string } | undefined;
  const email = setting?.email || footerInfo?.email;
  const phone = setting?.phone || footerInfo?.phone;
  const address = setting?.address || footerInfo?.address;
  return <main className="contact-page"><div className="breadcrumb"><Link href="/">হোম</Link><span>/</span><span>যোগাযোগ</span></div><section className="shop-intro"><div><span className="eyebrow">আপনার পাশে আছি</span><h1>কথা বলুন,<br /><em>খোঁজ নিন।</em></h1></div><p>পণ্য, ডেলিভারি বা অর্ডার সম্পর্কে জানতে নিচের তথ্য ব্যবহার করে আমাদের সঙ্গে যোগাযোগ করুন।</p></section><div className="contact-grid">{email && <a href={`mailto:${email}`} className="contact-card"><Mail /><span className="eyebrow">ইমেইল</span><strong>{email}</strong><small>আমাদের লিখুন</small></a>}{phone && <a href={`tel:${phone}`} className="contact-card"><Phone /><span className="eyebrow">ফোন</span><strong>{phone}</strong><small>আমাদের কল করুন</small></a>}{address && <article className="contact-card"><MapPin /><span className="eyebrow">ঠিকানা</span><strong>{address}</strong><small>ব্যবসার ঠিকানা</small></article>}{setting?.hours && <article className="contact-card"><span className="eyebrow">সময়</span><strong>{setting.hours}</strong><small>যোগাযোগের সময়</small></article>}{!email && !phone && !address && <div className="empty-results"><span>যোগাযোগের তথ্য যোগ করা হচ্ছে।</span><p>তথ্য প্রকাশিত হলে এখানে দেখতে পাবেন।</p></div>}</div></main>;
}
