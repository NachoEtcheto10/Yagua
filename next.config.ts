import type { NextConfig } from 'next'

// Fotos subidas desde el admin (Neon Object Storage)
const storageHost = (() => {
  try {
    return process.env.AWS_ENDPOINT_URL_S3 ? new URL(process.env.AWS_ENDPOINT_URL_S3).hostname : null
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
