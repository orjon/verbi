import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The verb list moved from /verbs to the home page, and each verb from
  // /verbs/<verb> to /<verb>.
  async redirects() {
    return [
      { source: "/verbs", destination: "/", permanent: false },
      { source: "/verbs/:verb", destination: "/:verb", permanent: false },
    ];
  },
};

export default nextConfig;
