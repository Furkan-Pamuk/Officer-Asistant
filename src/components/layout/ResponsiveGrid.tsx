import React from "react";

export type GridPreset = "dashboard" | "split" | "half" | "auto-fit" | "single";
export type GridGap = "xs" | "sm" | "md" | "lg";

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  preset?: GridPreset;
  gap?: GridGap;
  minItemWidth?: string;
  align?: "start" | "center" | "stretch" | "baseline";
  children: React.ReactNode;
}

const GAP_MAP: Record<GridGap, string> = {
  xs: "gap-2 sm:gap-2.5",
  sm: "gap-3 sm:gap-3.5",
  md: "gap-3.5 sm:gap-4 md:gap-5",
  lg: "gap-4 sm:gap-6 md:gap-8",
};

const ALIGN_MAP = {
  start: "items-start",
  center: "items-center",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

export default function ResponsiveGrid({
  preset = "dashboard",
  gap = "md",
  minItemWidth = "300px",
  align = "stretch",
  className = "",
  children,
  style,
  ...rest
}: ResponsiveGridProps) {
  let layoutClass = "";
  let inlineStyle: React.CSSProperties = { ...style };

  switch (preset) {
    case "dashboard":
      // Mobile 1 col -> Tablet 2 cols -> Desktop 3 cols -> Wide desktop 4 cols
      layoutClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
      break;
    case "split":
      // Master-detail split: 1 col on mobile, 1/3 + 2/3 on tablet and desktop
      layoutClass = "grid grid-cols-1 lg:grid-cols-12";
      break;
    case "half":
      // 1 col on mobile, 2 balanced cols on tablet/desktop
      layoutClass = "grid grid-cols-1 md:grid-cols-2";
      break;
    case "auto-fit":
      layoutClass = "grid";
      inlineStyle = {
        ...inlineStyle,
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}), 1fr))`,
      };
      break;
    case "single":
      layoutClass = "grid grid-cols-1 max-w-3xl mx-auto";
      break;
    default:
      layoutClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }

  return (
    <div
      className={`${layoutClass} ${GAP_MAP[gap]} ${ALIGN_MAP[align]} ${className}`.trim()}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Helper component for Master-Detail split pane */
export function GridMasterPane({
  span = 4,
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { span?: 3 | 4 | 5 }) {
  const spanClass = span === 3 ? "lg:col-span-3" : span === 5 ? "lg:col-span-5" : "lg:col-span-4";
  return (
    <div className={`min-w-0 ${spanClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function GridDetailPane({
  span = 8,
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { span?: 7 | 8 | 9 }) {
  const spanClass = span === 7 ? "lg:col-span-7" : span === 9 ? "lg:col-span-9" : "lg:col-span-8";
  return (
    <div className={`min-w-0 ${spanClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
