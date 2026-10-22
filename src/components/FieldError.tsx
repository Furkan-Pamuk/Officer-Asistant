"use client";

// Standard inline field error (form-error standardization).
export default function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">
      {msg}
    </p>
  );
}
