/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    // Configure max body size for API routes and middleware
    // This allows file uploads up to 100MB through API routes
    middlewareClientMaxBodySize: '100mb',
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig
