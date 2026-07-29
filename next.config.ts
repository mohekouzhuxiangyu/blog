import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  outputFileTracingRoot: process.cwd(),
  basePath: "/blog",
};

export default nextConfig;
