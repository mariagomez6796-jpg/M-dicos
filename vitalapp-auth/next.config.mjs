/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Development proxy rewrites to avoid CORS when calling a local backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8080/api/:path*', // �Y'^ nombre del servicio Docker,
      },
      {
        source: '/video/:path*',
        destination: 'http://videoapi:8000/:path*',
      },
    ]
  },
}

export default nextConfig
