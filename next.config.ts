import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✨ Static Export Configuration for Azure Static Web Apps
  output: 'export',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✨ Image Optimization - Modified for static export
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // ✨ Trailing slash for better static hosting compatibility
  trailingSlash: true,
  
  // ✨ Performance Optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // ✨ Production Optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
