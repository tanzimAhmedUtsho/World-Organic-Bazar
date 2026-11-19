"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc?: string;
};

/** Displays admin supplied images without the Next image proxy and falls back if the URL is stale. */
export function SafeImage({ src, fallbackSrc = "/images/product-placeholder.svg", ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const imageSrc = failed ? fallbackSrc : src;
  return <Image {...props} src={imageSrc} unoptimized onError={() => setFailed(true)} />;
}
