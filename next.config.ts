import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL('http://tbjbd6cen.hn-bkt.clouddn.com/images/**')
    ]
  }
};

export default nextConfig;
