"use client";

import { useEffect } from "react";

interface SocialLink {
  name: string;
  url?: string;
  active: boolean;
  badge?: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@sharkapplication",
    active: true,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/shark.application/",
    active: true,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/shark-application-a08282446/?isSelfProfile=true",
    active: true,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61595616215974",
    active: true,
  },
  {
    name: "X",
    url: "https://x.com/Sharkapplicatio",
    active: true,
  },
  {
    name: "WhatsApp Channel",
    url: "https://whatsapp.com/channel/0029Vb9Wl9yAu3aKG9rv8k2e",
    active: true,
  },
  {
    name: "YouTube",
    active: false,
    badge: "Coming soon",
  },
  {
    name: "Telegram",
    active: false,
    badge: "Coming soon",
  },
];

export default function LinksView() {
  // Prevent light rubber-banding / overscroll background on mobile devices
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#06131f";
    return () => {
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#06121e] text-white selection:bg-teal-500/20 selection:text-teal-300">
      {/* Deep-sea oceanic gradient background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(130% 110% at 85% 12%, #123d4b 0%, #0c2a35 28%, #081c26 52%, #05121c 80%, #030b12 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle circular radar / ARPA range lines in background */}
      <div
        className="pointer-events-none absolute -right-32 -top-24 sm:-right-10 sm:-top-16 z-0 h-[650px] w-[650px] sm:h-[800px] sm:w-[800px] select-none opacity-25"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Concentric radar range rings */}
          <circle cx="580" cy="240" r="130" stroke="#7ad0c9" strokeWidth="1" strokeDasharray="3 4" opacity="0.45" />
          <circle cx="580" cy="240" r="230" stroke="#7ad0c9" strokeWidth="1" opacity="0.6" />
          <circle cx="580" cy="240" r="350" stroke="#7ad0c9" strokeWidth="1.2" opacity="0.75" />
          <circle cx="580" cy="240" r="490" stroke="#7ad0c9" strokeWidth="1" strokeDasharray="5 6" opacity="0.5" />
          <circle cx="580" cy="240" r="640" stroke="#7ad0c9" strokeWidth="1.2" opacity="0.65" />
          <circle cx="580" cy="240" r="790" stroke="#7ad0c9" strokeWidth="1" opacity="0.4" />

          {/* Radial bearing rays */}
          <line x1="580" y1="240" x2="160" y2="600" stroke="#7ad0c9" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.3" />
          <line x1="580" y1="240" x2="120" y2="380" stroke="#7ad0c9" strokeWidth="0.8" opacity="0.25" />
        </svg>
      </div>

      {/* Content Container (Mobile-first centered column) */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md sm:max-w-lg flex-col justify-between px-6 py-9 sm:px-8 sm:py-12">
        {/* Top Header & Intro */}
        <div>
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3.5">
            {/* Shark Fin App Icon Badge */}
            <div
              className="relative flex h-11 w-11 sm:h-12 sm:w-12 flex-col items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-[#0e2738] to-[#061421] p-1 shadow-lg"
            >
              {/* Fin Shape */}
              <svg
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:h-7 sm:w-7"
                aria-hidden="true"
              >
                <path
                  d="M14 33 C18 22 23 15 34 9 C30 19 28 26 28 33 Z"
                  fill="#F4F7FA"
                />
                <path
                  d="M14 33 C18 22 23 15 34 9"
                  stroke="#22D3EE"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              {/* Micro text inside icon */}
              <span className="text-[7px] font-black tracking-widest text-slate-400 -mt-0.5 select-none">
                SHARK
              </span>
            </div>

            {/* Brand Title */}
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider text-white">
              SHARK
            </span>
          </div>

          {/* Headline & Subtitle */}
          <div className="mt-8 sm:mt-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              <span className="block text-white">SAME CREW.</span>
              <span className="block text-[#7ad0c9] mt-0.5">MORE PLACES.</span>
            </h1>
            <p className="mt-2.5 text-sm sm:text-base font-normal text-[#8FA3B0]">
              Following us on our other channels?
            </p>
          </div>

          {/* Social Links List */}
          <div className="mt-8 sm:mt-10 divide-y divide-[#133748]/60 border-t border-[#133748]/60">
            {SOCIAL_LINKS.map((link) => {
              if (link.active && link.url) {
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between py-4 sm:py-4.5 px-2 -mx-2 rounded-xl transition-colors duration-200 hover:bg-white/5 active:bg-white/10"
                  >
                    <span className="text-base sm:text-lg font-semibold tracking-tight text-white group-hover:text-[#a0ece3] transition-colors">
                      {link.name}
                    </span>
                    {/* Glowing turquoise indicator dot */}
                    <span
                      className="h-2 w-2 rounded-full bg-[#69D8C8] group-hover:scale-125 transition-transform"
                      style={{ boxShadow: "0 0 8px #69D8C8" }}
                      aria-hidden="true"
                    />
                  </a>
                );
              }

              return (
                <div
                  key={link.name}
                  className="flex items-center justify-between py-4 sm:py-4.5 px-2 select-none cursor-default"
                >
                  <span className="text-base sm:text-lg font-semibold tracking-tight text-[#658291]">
                    {link.name}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#408986]">
                    {link.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-12 sm:mt-16 pt-6 pb-2">
          <p className="text-base sm:text-lg font-bold text-[#7ad0c9]">
            Your whole life at sea.
          </p>
          <p className="mt-1 text-sm sm:text-base text-[#8FA3B0]">
            Stay connected with Shark.
          </p>
        </div>
      </div>
    </div>
  );
}
