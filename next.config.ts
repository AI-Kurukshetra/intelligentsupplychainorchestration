import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  transpilePackages: ["recharts", "@base-ui/react"],
};

export default nextConfig;
