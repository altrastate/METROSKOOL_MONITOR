import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  agentRules: false,
  experimental: {
    optimizePackageImports: ["@metroskool/web-ui", "@metroskool/brand"],
  },
  transpilePackages: [
    "@metroskool/audit",
    "@metroskool/brand",
    "@metroskool/contracts",
    "@metroskool/supabase-client",
    "@metroskool/web-ui",
    "metroskool-monitor-offline",
  ],
};

export default nextConfig;
