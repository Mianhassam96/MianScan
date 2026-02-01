import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Configure paths for GitHub Pages
  ...(isProd && isGitHubPages && {
    assetPrefix: '/MianScan/',
    basePath: '/MianScan',
  }),
  
  // Add trailing slash for better compatibility
  trailingSlash: true,
  
  // Skip trailing slash redirect for static export
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
