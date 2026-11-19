import type { Metadata } from "next";
import "./globals.css";
import "./brand.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  applicationName: "World অর্গানিক বাজার",
  title: { default: "World অর্গানিক বাজার — বাংলার খাঁটি খাবার", template: "%s — World অর্গানিক বাজার" },
  description: "বাংলাদেশের ঐতিহ্যবাহী ও খাঁটি খাবারের যত্নে বাছাই করা বাজার।",
  openGraph: {
    type: "website",
    siteName: "World অর্গানিক বাজার",
    title: "World অর্গানিক বাজার — বাংলার খাঁটি খাবার",
    description: "বাংলাদেশের ঐতিহ্যবাহী খাবার ও স্বাদের ঠিকানা।",
    images: ["/images/world-organic-bazar-logo.svg"],
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const structuredData = JSON.stringify([
    { "@context": "https://schema.org", "@type": "Organization", name: "World অর্গানিক বাজার", url: base, founder: [{ "@type": "Person", name: "Tanzim Ahmed Utsho" }, { "@type": "Person", name: "Zabir Ahmed Turzo" }], description: "বাংলাদেশের ঐতিহ্যবাহী ও খাঁটি খাবারের বাজার।" },
    { "@context": "https://schema.org", "@type": "WebSite", name: "World অর্গানিক বাজার", url: base, potentialAction: { "@type": "SearchAction", target: `${base}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" } },
  ]).replace(/</g, "\\u003c");
  return <html lang="bn"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />{children}</body></html>;
}
