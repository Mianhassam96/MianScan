import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export configuration for GitHub Pages
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  // Only add basePath and assetPrefix for production GitHub Pages
  ...(process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS && {
    basePath: '/MianScan',
    assetPrefix: '/MianScan/',
  }),
  // Disable server-side features for static export
  experimental: {
    esmExternals: false
  }
};

export default nextConfig;
