"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import SharkMark from "@/components/SharkMark";

type Mode = "login" | "register";

function LoginForm() {
  useDocTitle("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const { user, refresh } = useAuth();
  const { t } = useLocale();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedSeconds, setLockedSeconds] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Already authenticated — redirect.
  useEffect(() => {
    if (user) router.replace(returnUrl);
  }, [user, router, returnUrl]);

  // Lockout countdown.
  useEffect(() => {
    if (lockedSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockedSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedSeconds]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body =
      mode === "register"
        ? { email, password, displayName: displayName.trim() || email.split("@")[0] }
        : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setLockedSeconds(data.retryAfter || 600);
          setError(data.error || t("auth.tooManyAttempts"));
        } else {
          setError(data.error || t("auth.genericError"));
        }
        return;
      }

      if (data.success) {
        await refresh();
        router.push(returnUrl);
      }
    } catch {
      setError(t("auth.networkError"));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
  }

  return (
    <div className="shark-interior-page min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center">
            <SharkMark size={48} />
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-stone-900 dark:text-stone-100">
            {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {mode === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-xl sm:p-8 dark:border-stone-800 dark:bg-neutral-950">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200 flex items-start gap-3">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p>{error}</p>
                {lockedSeconds > 0 && (
                  <p className="mt-1 font-mono font-bold text-red-600 dark:text-red-400">
                    {t("auth.cooldown")}: {Math.floor(lockedSeconds / 60)}m {lockedSeconds % 60}s
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (Register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t("auth.displayName")}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={lockedSeconds > 0 || loading}
                  placeholder={t("auth.displayNamePlaceholder")}
                  autoComplete="name"
                  className="w-full rounded-xl border border-amber-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t("auth.email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={lockedSeconds > 0 || loading}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-amber-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={mode === "register" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={lockedSeconds > 0 || loading}
                  placeholder={mode === "register" ? t("auth.passwordMin") : "••••••••"}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="w-full rounded-xl border border-amber-200 bg-stone-50 px-3.5 py-2.5 pr-12 text-sm text-stone-900 focus:border-amber-500 focus:outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 text-sm"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={lockedSeconds > 0 || loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-sm font-bold text-amber-50 hover:bg-stone-800 disabled:opacity-50 dark:bg-red-700 dark:text-white dark:hover:bg-red-600 transition-colors"
              >
                {loading
                  ? t("auth.loading")
                  : mode === "login"
                    ? t("auth.loginButton")
                    : t("auth.registerButton")}
              </button>
            </div>
          </form>

          {/* OAuth placeholder */}
          <div className="mt-5 border-t border-stone-100 pt-5 dark:border-stone-900">
            <p className="mb-3 text-center text-xs text-stone-400 dark:text-stone-500">
              {t("auth.comingSoon")}
            </p>
            <div className="flex gap-2">
              <button
                disabled
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-500 cursor-not-allowed opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button
                disabled
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-500 cursor-not-allowed opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.11 4.45-3.74 4.25z"/></svg>
                Apple
              </button>
            </div>
          </div>

          {/* Switch mode */}
          <div className="mt-5 text-center">
            <button
              onClick={switchMode}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
            >
              {mode === "login" ? t("auth.switchToRegister") : t("auth.switchToLogin")}
            </button>
          </div>
        </div>

        {/* Return home */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          >
            ← {t("auth.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="shark-interior-page min-h-[85vh] flex items-center justify-center py-10 px-4">
          <div className="flex h-12 w-12 items-center justify-center animate-pulse">
            <SharkMark size={48} />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
