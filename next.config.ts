import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // localhost:3000 can be taken by another dev server on IPv6, so allow opening it via 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  // The old LíderHub project page became the experience page plus one project per case.
  async redirects() {
    return [
      { source: "/projects/liderhub", destination: "/experience/liderhub", permanent: true },
      { source: "/en/projects/liderhub", destination: "/en/experience/liderhub", permanent: true },
    ];
  },
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
