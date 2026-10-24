"use client";

import React from "react";
import ResponsiveNavigation from "./ResponsiveNavigation";
import ResponsiveContainer, { ResponsiveContainerProps } from "./ResponsiveContainer";

export interface AppShellProps {
  children: React.ReactNode;
  containerSize?: ResponsiveContainerProps["size"];
  padded?: boolean;
  className?: string;
}

export default function AppShell({
  children,
  containerSize = "standard",
  padded = true,
  className = "",
}: AppShellProps) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#F4F7FA] text-[#081120] dark:bg-black dark:text-red-200">
      {/* 3-Tier Adaptive Navigation (Topbar, Rail, BottomBar + Drawer) */}
      <ResponsiveNavigation />

      {/* Main Content Area */}
      {/* Note: Tablet rail offsets by 68px on md screens (md:pl-[68px] xl:pl-0), mobile bottom bar adds pb-20 */}
      <main className="flex-1 md:pl-[68px] xl:pl-0 pb-20 md:pb-8 pt-4 sm:pt-6 transition-all">
        <ResponsiveContainer size={containerSize} padded={padded} className={className}>
          {children}
        </ResponsiveContainer>
      </main>
    </div>
  );
}
