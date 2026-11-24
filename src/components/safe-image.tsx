"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc?: string;
};

/** Keeps admin supplied remote images direct, while letting Next optimize local assets. */
export function SafeImage({ src, fallbackSrc = "/images/product-placeholder.svg", ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const imageSrc = failed ? fallbackSrc : src;
  return <Image {...props} src={imageSrc} unoptimized={/^https?:\/\//i.test(imageSrc)} onError={() => setFailed(true)} />;
}
