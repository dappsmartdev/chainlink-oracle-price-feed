// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/trustwallet/assets/master/blockchains/polygon/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        // Placeholder URLs don't have a deep path structure, so we can use a broad pattern
        pathname: '/**',
      },
       {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig