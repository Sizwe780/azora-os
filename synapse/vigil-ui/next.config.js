/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_VIGIL_API_URL: process.env.NEXT_PUBLIC_VIGIL_API_URL || 'http://localhost:3005'
  },
  async rewrites() {
    return [
      {
        source: '/api/vigil/:path*',
        destination: 'http://localhost:3005/api/vigil/:path*'
      }
    ];
  }
};

module.exports = nextConfig;