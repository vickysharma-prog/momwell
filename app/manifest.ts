import type { MetadataRoute } from "next";

// Momwell as a phone app, installed from the browser to the home screen. Icons come from scripts/app-icons.ts.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Momwell",
    short_name: "Momwell",
    description: "Care for pregnancy and the year after birth, made around her, with her people beside her.",
    id: "/",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#F8F6FB",
    theme_color: "#5B4B8A",
    categories: ["health", "medical", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
