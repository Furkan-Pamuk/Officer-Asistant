import type { Metadata } from "next";
import LinksView from "./LinksView";

export const metadata: Metadata = {
  title: "Shark — Same Crew. More Places.",
  description: "Official social media channels and community links for Shark maritime assistant.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Shark — Same Crew. More Places.",
    description: "Official social media channels and community links for Shark maritime assistant.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shark — Same Crew. More Places.",
    description: "Official social media channels and community links for Shark maritime assistant.",
  },
};

export default function LinksPage() {
  return <LinksView />;
}
