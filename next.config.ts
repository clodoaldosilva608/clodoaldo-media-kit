import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" removed — Vercel handles output natively
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "https://preview-chat-8e0db441-89cb-408f-b4da-aa1e00aa1aff.space-z.ai",
    "https://*.space-z.ai",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.lovable.app" },
      { protocol: "https", hostname: "**.space-z.ai" },
    ],
  },
};

export default nextConfig;
