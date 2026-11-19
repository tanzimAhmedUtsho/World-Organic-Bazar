import Image from "next/image";

type BrandLogoProps = {
  variant?: "store" | "footer" | "admin" | "admin-login";
};

export function BrandLogo({ variant = "store" }: BrandLogoProps) {
  return (
    <span className={`brand-lockup brand-lockup-${variant}`}>
      <span className="brand-logo-frame">
        <Image
          src="/images/world-organic-bazar-logo.png"
          alt="World অর্গানিক বাজার — প্রকৃতির উপহার, আপনার পরিবারের জন্য"
          fill
          unoptimized
          sizes="(max-width: 700px) 165px, 240px"
          className="brand-image"
        />
      </span>
    </span>
  );
}
