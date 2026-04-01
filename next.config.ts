import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const rootDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  compiler: {
    styledComponents: true,
  },
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
