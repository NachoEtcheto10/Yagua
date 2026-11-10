import type { NextConfig } from 'next'

// Fotos subidas desde el admin (Neon Object Storage)
const storageHost = (() => {
  try {
    const url = process.env.STORAGE_ENDPOINT_URL || process.env.AWS_ENDPOINT_URL_S3
    return url ? new URL(url).hostname : null
  } catch {
    return null
  }
})()

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: storageHost ? [{ protocol: 'https', hostname: storageHost }] : [],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
    // Fotos: el navegador las achica antes de subirlas (Vercel limita el body a 4,5 MB)
    serverActions: { bodySizeLimit: '4mb' },
  },
}

export default nextConfig
