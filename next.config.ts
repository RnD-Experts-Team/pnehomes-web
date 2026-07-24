import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Strip console.* in production builds (keep errors) instead of editing every file.
  compiler: {
    removeConsole: { exclude: ['error'] },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
