import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product and editorial images are supplied through the admin and may use
    // customer-selected hosts, so load their original URLs instead of routing
    // them through Next's host-restricted image optimizer.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
