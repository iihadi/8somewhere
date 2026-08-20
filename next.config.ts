import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local photos only for now. Add remotePatterns here if you ever
    // serve images from a bucket / CDN instead of /public.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
