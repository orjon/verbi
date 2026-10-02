import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Addresses here are relative to the manifest, so they work wherever the site is
// put: at /verbi/ in production, at the root in development.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verbi",
    short_name: "Verbi",
    description: "Italian verbs, every form, with no connection needed.",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
