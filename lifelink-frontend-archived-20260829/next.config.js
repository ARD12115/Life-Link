/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.basemaps.cartocdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'static.cloudflareinsights.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'framer-motion', 'lucide-react'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ],
}

module.exports = nextConfig