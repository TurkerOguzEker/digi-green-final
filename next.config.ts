import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Build sırasında TypeScript hatalarını görmezden gelir
    ignoreBuildErrors: true,
  },
};

export default nextConfig;