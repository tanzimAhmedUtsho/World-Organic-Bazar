import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/layout/auth-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "অ্যাকাউন্টে প্রবেশ", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; registered?: string }> }) {
  const session = await auth(); const query = await searchParams;
  const callbackUrl = query.callbackUrl?.startsWith("/") && !query.callbackUrl.startsWith("//") ? query.callbackUrl : "/account";
  if (session?.user) redirect(callbackUrl);
  return <main className="auth-page"><div className="auth-card"><span className="eyebrow">আবার স্বাগতম</span><h1>আপনাকে<br /><em>ফিরে পেয়ে ভালো লাগছে।</em></h1><p>আপনার অর্ডার, ঠিকানা ও পছন্দের পণ্য দেখতে প্রবেশ করুন।</p>{query.registered && <p className="checkout-success" role="status">অ্যাকাউন্ট তৈরি হয়েছে। চালিয়ে যেতে প্রবেশ করুন।</p>}<LoginForm callbackUrl={callbackUrl} /></div></main>;
}
