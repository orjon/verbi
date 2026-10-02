import type { NextConfig } from "next";

// In production the site is written out as plain files and uploaded to a bucket,
// to be served at orjon.com/verbi. Development runs at the root of localhost as usual.
const production = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactCompiler: true,
  ...(production && {
    output: "export",
    basePath: "/verbi",
    // /verbi/cominciare/ is written as /cominciare/index.html, which a bucket serves.
    trailingSlash: true,
  }),
};

export default nextConfig;
