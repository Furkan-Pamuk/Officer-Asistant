"use client";
import { useState } from "react";

// Date/datetime inputs ignore the placeholder attribute, so browsers always
// show the locale format (gg.aa.yyyy). This renders as text with a real
// placeholder while empty + blurred, and switches to the picker on focus.
export default function DateField({
  value,
  onChange,
  placeholder,
  mode = "date",
  className,
  title,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  mode?: "date" | "datetime";
  className?: string;
  title?: string;
}) {
  const [focused, setFocused] = useState(false);
  const showPicker = focused || value !== "";
  return (
    <input
      type={showPicker ? (mode === "datetime" ? "datetime-local" : "date") : "text"}
      value={value}
      placeholder={placeholder}
      title={title ?? placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        // open the native picker straight away instead of showing text first
        requestAnimationFrame(() => {
          try {
            (e.target as HTMLInputElement).showPicker();
          } catch {
            /* older browsers: picker opens on icon click */
          }
        });
      }}
      onBlur={() => setFocused(false)}
      className={className}
    />
  );
}
