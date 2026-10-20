import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shark",
    short_name: "Shark",
    description: "Your whole life at sea, in one app. Offline-ready.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F4F7FA",
    theme_color: "#081120",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
