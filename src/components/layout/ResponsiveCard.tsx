"use client";

import React, { useState } from "react";

export type CardStatus = "normal" | "info" | "warning" | "alarm";

export interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
  status?: CardStatus;
  statusLabel?: string;
  telemetryValue?: string | number;
  telemetryUnit?: string;
  trend?: "up" | "down" | "steady";
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expandableModal?: boolean;
  children?: React.ReactNode;
}

const STATUS_BORDER_MAP: Record<CardStatus, string> = {
  normal: "border-slate-200/90 dark:border-red-950/80",
  info: "border-teal-300 dark:border-red-800",
  warning: "border-amber-300 dark:border-amber-700",
  alarm: "border-red-500 dark:border-red-600 animate-pulse",
};

const STATUS_BADGE_MAP: Record<CardStatus, string> = {
  normal: "bg-slate-100 text-slate-700 dark:bg-red-950/40 dark:text-red-300",
  info: "bg-teal-50 text-teal-800 dark:bg-red-900/60 dark:text-teal-200",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  alarm: "bg-red-600 text-white dark:bg-red-900 dark:text-red-100",
};

export default function ResponsiveCard({
  title,
  subtitle,
  icon,
  status = "normal",
  statusLabel,
  telemetryValue,
  telemetryUnit,
  trend,
  actions,
  collapsible = false,
  defaultExpanded = true,
  expandableModal = false,
  className = "",
  children,
  ...rest
}: ResponsiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div
        className={`@container relative flex flex-col rounded-2xl border bg-white p-4 shadow-xs transition-shadow hover:shadow-md dark:bg-[#0c0c0e] ${
          STATUS_BORDER_MAP[status]
        } ${className}`.trim()}
        {...rest}
      >
        {/* Card Header */}
        {(title || icon || actions || statusLabel || collapsible || expandableModal) && (
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100/80 dark:border-red-950/50">
            <div className="flex items-center gap-2.5 min-w-0">
              {icon && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg border border-slate-200/70 dark:bg-red-950/30 dark:border-red-900/40">
                  {icon}
                </span>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="truncate font-bold tracking-tight text-slate-900 dark:text-red-200 text-fluid-sm sm:text-fluid-base">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="truncate text-fluid-xs text-slate-500 dark:text-red-300/70">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {statusLabel && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE_MAP[status]}`}
                >
                  {statusLabel}
                </span>
              )}

              {actions}

              {expandableModal && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  aria-label="Expand fullscreen"
                  title="Expand Card"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-red-400/60 dark:hover:bg-red-950"
                >
                  ⛶
                </button>
              )}

              {collapsible && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Collapse card" : "Expand card"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-red-400/60 dark:hover:bg-red-950 text-xs font-bold"
                >
                  {isExpanded ? "▴" : "▾"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Telemetry Display (if supplied) */}
        {telemetryValue !== undefined && (
          <div className="py-2.5 flex items-baseline justify-between border-b border-slate-100/80 dark:border-red-950/50">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-fluid-readout font-extrabold tracking-tight font-tabular text-slate-900 dark:text-red-100">
                {telemetryValue}
              </span>
              {telemetryUnit && (
                <span className="text-fluid-xs font-bold uppercase tracking-wider text-slate-500 dark:text-red-300/70">
                  {telemetryUnit}
                </span>
              )}
            </div>

            {trend && (
              <span
                className={`font-mono text-xs font-bold ${
                  trend === "up"
                    ? "text-teal-600 dark:text-teal-400"
                    : trend === "down"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-400 dark:text-red-400/50"
                }`}
              >
                {trend === "up" ? "▲ RISING" : trend === "down" ? "▼ FALLING" : "▶ STEADY"}
              </span>
            )}
          </div>
        )}

        {/* Main Card Content */}
        {isExpanded && children && <div className="mt-3 flex-1 min-w-0">{children}</div>}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6"
        >
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl overflow-hidden dark:border-red-950 dark:bg-[#0c0c0e]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-red-950">
              <div className="flex items-center gap-2">
                {icon && <span className="text-xl">{icon}</span>}
                <h2 className="font-bold text-lg text-slate-900 dark:text-red-100">{title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-red-950 dark:text-red-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto min-h-0">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
