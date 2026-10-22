import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import SharkIntro from "@/components/SharkIntro";
import OfflineBanner from "@/components/OfflineBanner";
import SWRegister from "@/components/SWRegister";
import ReminderChecker from "@/components/ReminderChecker";
import AutoLog from "@/components/AutoLog";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Shark — Your whole life at sea, in one app",
  description: "Don't be the prey. Be the shark. Inspection check cards, job checklists, navigation tools, career documents and life aboard — offline-first PWA for the whole crew.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Shark", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#081120" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('oa-theme');if(t==='night'){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F7FA] text-stone-900 dark:bg-black dark:text-red-200">
        <I18nProvider>
        <SharkIntro />
        <SWRegister />
        <ReminderChecker />
        <AutoLog />
        <Suspense fallback={null}>
          <OfflineBanner />
          <Navbar />
        </Suspense>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
