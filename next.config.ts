import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk', '@imgly/background-removal'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent imgly from being bundled on the server
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@imgly/background-removal',
      ];
    }
    return config;
  },
};

export default nextConfig;
