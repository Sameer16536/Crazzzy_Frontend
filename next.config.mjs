/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'videos.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'crazzzybackend-production.up.railway.app',
      },
    ],
  },
  async headers() {
    return [
      {
        // Prevent Vercel Edge / CDN from caching any API proxy responses
        source: '/api-proxy/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://crazzzybackend-production.up.railway.app/api/:path*',
      },
      {
        source: '/backend-static/:path*',
        destination: 'https://crazzzybackend-production.up.railway.app/:path*',
      },
    ]
  },
}

export default nextConfig
