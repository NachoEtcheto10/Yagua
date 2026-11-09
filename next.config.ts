import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // TODO: sumar el dominio de Cloudinary / Vercel Blob / Neon Object Storage cuando se suban fotos desde el admin
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
}

export default nextConfig
