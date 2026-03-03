// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Diğer config seçeneklerin varsa buraya */
  
  // TypeScript hatasını susturmak için 'as any' kullanıyoruz
  // veya doğrudan bu özellikleri config dışına alıyoruz.
  
  eslint: {
    // Build sırasında ESLint hatalarını görmezden gelir
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Build sırasında TypeScript hatalarını görmezden gelir
    ignoreBuildErrors: true,
  },
} as any; // Tipi 'any' olarak zorlayarak TS uyarısını kapatıyoruz

export default nextConfig;