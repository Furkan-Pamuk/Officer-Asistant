import React from "react";

export interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLElement> {
  size?: "full" | "standard" | "narrow";
  padded?: boolean;
  safeArea?: boolean;
  as?: "div" | "main" | "section" | "article";
  children: React.ReactNode;
}

const SIZE_MAP = {
  full: "w-full",
  standard: "mx-auto w-full max-w-7xl",
  narrow: "mx-auto w-full max-w-3xl",
};

export default function ResponsiveContainer({
  size = "standard",
  padded = true,
  safeArea = false,
  as: Component = "div",
  className = "",
  children,
  ...rest
}: ResponsiveContainerProps) {
  const paddingClass = padded
    ? size === "full"
      ? "px-2 sm:px-4 md:px-6"
      : "px-3 sm:px-5 md:px-6 lg:px-8"
    : "";

  const safeAreaClass = safeArea
    ? "pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]"
    : "";

  return (
    <Component
      className={`min-w-0 transition-all ${SIZE_MAP[size]} ${paddingClass} ${safeAreaClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}
