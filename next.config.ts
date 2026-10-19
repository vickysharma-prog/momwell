import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  // Landing photography from Unsplash (free licence), served through Next for sizing.
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Mounts the Momwell agent (agent/) at /eve/v1/* on the same origin as the app.
export default withEve(nextConfig);
