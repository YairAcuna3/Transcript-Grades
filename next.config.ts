import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // xlsx y file-saver usan APIs de browser, no deben bundlearse en el servidor
      config.externals = [...(config.externals ?? []), "xlsx", "file-saver"];
    }
    return config;
  },
};

export default nextConfig;
