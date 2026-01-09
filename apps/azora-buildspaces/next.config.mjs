/** @type {import('next').NextConfig} */
import { securityHeaders } from "./lib/security-headers.js"

const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@azora/components"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
