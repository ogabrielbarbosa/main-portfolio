import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // localhost:3000 can be taken by another dev server on IPv6, so allow opening it via 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
