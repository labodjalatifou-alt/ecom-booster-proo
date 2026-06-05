import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk', '@imgly/background-removal', 'canvas', '@fal-ai/client'],
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.fal.run' },
      { protocol: 'https', hostname: '**.fal.media' },
      { protocol: 'https', hostname: 'storage.fal.ai' },
      { protocol: 'https', hostname: '**.storage.googleapis.com' },
    ],
  },
};

export default nextConfig;
