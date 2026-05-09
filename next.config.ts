import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk'],
  experimental: {
    // Ensures crypto works properly in API routes
  }
};

export default nextConfig;
