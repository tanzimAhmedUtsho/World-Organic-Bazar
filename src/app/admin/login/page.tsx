import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin Sign In", icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" }, robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.roles?.length) redirect("/admin");
  return <main className="admin-login-page"><div className="admin-login-card"><BrandLogo variant="admin-login" /><span className="eyebrow">WORLD ORGANIC BAZAR · CONTROL ROOM</span><h1>Welcome<br /><em>back.</em></h1><p>Sign in with an administrator account to manage the market.</p><AdminLoginForm /><a href="/" className="admin-back-link">← Return to the market</a></div></main>;
}
