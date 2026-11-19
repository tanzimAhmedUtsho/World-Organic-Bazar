import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegistrationForm } from "@/components/layout/auth-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "নতুন অ্যাকাউন্ট", robots: { index: false, follow: false } };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/account");
  return <main className="auth-page"><div className="auth-card"><span className="eyebrow">বাজারে আপনার অ্যাকাউন্ট</span><h1>অ্যাকাউন্ট<br /><em>তৈরি করুন।</em></h1><p>ডেলিভারির তথ্য, অর্ডারের ইতিহাস ও পছন্দের পণ্য এক জায়গায় রাখুন।</p><RegistrationForm /></div></main>;
}
