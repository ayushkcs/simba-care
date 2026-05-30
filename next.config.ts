import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in a parent dir was causing Next
  // to infer the wrong root. This keeps builds deterministic locally and on CI.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
