import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@/*": ["./src/*"],
    },
  },
    allowedDevOrigins: ['10.198.166.22'],
};

export default nextConfig;
