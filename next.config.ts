import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel - we need server-side API routes
  // output: 'export',
  
  // Enable image optimization for Vercel
  images: {
    unoptimized: false,
    domains: ['mianhassam96.github.io'],
  },
  
  // No basePath or assetPrefix for Vercel
  // These are only needed for GitHub Pages
  
  // Disable experimental features that cause warnings
  experimental: {
    // Remove esmExternals to fix Turbopack warning
  },
};

export default nextConfig;
