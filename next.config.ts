import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    assetPrefix: '/MianScan',
    basePath: '/MianScan',
  }),
  
  // Development configuration
  ...(process.env.NODE_ENV !== 'production' && {
    images: {
      unoptimized: true
    }
  })
};

export default nextConfig;
