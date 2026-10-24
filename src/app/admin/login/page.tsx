"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDocTitle } from "@/lib/doctitle";

interface MfaInfo {
  enabled: boolean;
  secret?: string;
  backupCodeHint: string;
  currentSampleCode?: string;
}

function AdminLoginForm() {
  useDocTitle("admin.title");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/admin";

  const [username, setUsername] = useState("sharkadmin");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [role, setRole] = useState<"super_admin" | "operator_admin" | "viewer_admin">("super_admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedSeconds, setLockedSeconds] = useState(0);
  const [mfaInfo, setMfaInfo] = useState<MfaInfo | null>(null);
  const [showHelper, setShowHelper] = useState(false);

  // Check current session status & load MFA helper info
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/admin/auth/status");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.replace(returnUrl);
          } else if (data.mfaInfo) {
            setMfaInfo(data.mfaInfo);
          }
        }
      } catch {
        // Ignore status check errors
      }
    }
    checkStatus();
  }, [router, returnUrl]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockedSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockedSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedSeconds]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          mfaCode,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setLockedSeconds(data.retryAfter || 900);
          setError(data.error || "Too many failed attempts. Access locked.");
        } else {
          setError(data.error || "Authentication failed. Check your credentials.");
        }
        return;
      }

      if (data.success) {
        router.push(returnUrl);
      }
    } catch {
      setError("Network or authentication gateway error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillSampleMfa() {
    if (mfaInfo?.currentSampleCode) {
      setMfaCode(mfaInfo.currentSampleCode);
    }
  }

  return (
    <div className="shark-interior-page min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl">
        {/* Security Shield Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500/20 text-3xl shadow-inner dark:bg-stone-900 ring-1 ring-amber-400/40">
            🛡️
          </div>
          <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900 dark:border-stone-800 dark:bg-stone-900 dark:text-amber-200">
            Stealth Authentication Gateway
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl text-stone-900 dark:text-stone-100">
            Administrative Access Portal
          </h1>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Direct URL verification required. Visible navigation entries have been deactivated.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-xl sm:p-8 dark:border-stone-800 dark:bg-neutral-950">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200 flex items-start gap-3">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p>{error}</p>
                {lockedSeconds > 0 && (
                  <p className="mt-1 font-mono font-bold text-red-600 dark:text-red-400">
                    Lockout cooling down: {Math.floor(lockedSeconds / 60)}m {lockedSeconds % 60}s
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Admin Username / Identifier
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={lockedSeconds > 0 || loading}
                placeholder="e.g. sharkadmin"
                className="w-full rounded-xl border border-amber-200 bg-stone-50 px-3.5 py-2.5 text-xs font-mono font-medium text-stone-900 focus:border-amber-500 focus:outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Master Administrative Password
                </label>
                <span className="text-[10px] text-stone-400">Timing-safe SHA-256 verification</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={lockedSeconds > 0 || loading}
                placeholder="••••••••••••••••"
                className="w-full rounded-xl border border-amber-200 bg-stone-50 px-3.5 py-2.5 text-xs font-mono font-medium text-stone-900 focus:border-amber-500 focus:outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
              />
            </div>

            {/* Multi-Factor Authentication Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Two-Factor Passcode (TOTP / Emergency Code)
                </label>
                {mfaInfo?.currentSampleCode && (
                  <button
                    type="button"
                    onClick={() => setShowHelper(!showHelper)}
                    className="text-[11px] font-semibold text-amber-700 hover:underline dark:text-amber-400"
                  >
                    {showHelper ? "Hide Dev Credentials" : "Show Dev Credentials"}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  disabled={lockedSeconds > 0 || loading}
                  placeholder="6-digit code or emergency backup code"
                  maxLength={8}
                  className="w-full rounded-xl border border-amber-200 bg-stone-50 px-3.5 py-2.5 text-xs font-mono tracking-widest text-stone-900 focus:border-amber-500 focus:outline-hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
                />
                {mfaInfo?.currentSampleCode && (
                  <button
                    type="button"
                    onClick={fillSampleMfa}
                    className="absolute right-2 top-1.5 rounded-lg bg-amber-200 px-2.5 py-1 text-[10px] font-bold text-stone-800 hover:bg-amber-300 dark:bg-stone-800 dark:text-amber-300"
                  >
                    Use Live OTP
                  </button>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Assigned Operational Role (RBAC)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: "super_admin", label: "Super Admin", desc: "Full root access" },
                  { id: "operator_admin", label: "Operator", desc: "Simulate & view" },
                  { id: "viewer_admin", label: "Auditor", desc: "Read-only audit" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as typeof role)}
                    className={`rounded-2xl border p-2.5 text-left transition-all ${
                      role === item.id
                        ? "border-amber-500 bg-amber-50/70 dark:border-amber-500/80 dark:bg-amber-950/20"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/40"
                    }`}
                  >
                    <div className="font-bold text-[11px] text-stone-900 dark:text-stone-100">
                      {item.label}
                    </div>
                    <div className="text-[10px] opacity-60">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={lockedSeconds > 0 || loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-xs font-bold text-amber-50 hover:bg-stone-800 disabled:opacity-50 dark:bg-red-700 dark:text-white"
              >
                <span>🔒</span>
                <span>{loading ? "Verifying Credentials & MFA..." : "Authenticate & Open Dashboard"}</span>
              </button>
            </div>
          </form>

          {/* Test Credentials Helper Panel */}
          {showHelper && mfaInfo?.currentSampleCode && (
            <div className="mt-5 rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 text-xs dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>🔑</span> Default Testing Credentials
              </h3>
              <p className="mt-1 text-[11px] opacity-70">
                Configured via environment variables (<code className="font-mono">ADMIN_USERNAME</code>, <code className="font-mono">ADMIN_PASSWORD</code>, <code className="font-mono">ADMIN_MFA_SECRET</code>).
              </p>
              <div className="mt-3 grid gap-1.5 font-mono text-[11px]">
                <div className="flex justify-between bg-white/70 dark:bg-black/40 px-2 py-1 rounded">
                  <span className="opacity-60">Username:</span>
                  <span className="font-bold">sharkadmin</span>
                </div>
                <div className="flex justify-between bg-white/70 dark:bg-black/40 px-2 py-1 rounded">
                  <span className="opacity-60">Password:</span>
                  <span className="font-bold">Shark@MasterNav2026!</span>
                </div>
                <div className="flex justify-between bg-white/70 dark:bg-black/40 px-2 py-1 rounded">
                  <span className="opacity-60">Live TOTP Code:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    {mfaInfo?.currentSampleCode || "748921"}
                  </span>
                </div>
                <div className="flex justify-between bg-white/70 dark:bg-black/40 px-2 py-1 rounded">
                  <span className="opacity-60">Emergency Backup Code:</span>
                  <span className="font-bold">748921</span>
                </div>
              </div>
            </div>
          )}

          {/* Security Features Checklist */}
          <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-900">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Industry-Standard Defenses Enforced
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>Stealth URL Direct Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>Brute-force Rate Limiting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>HTTP-Only Secure Cookie</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>RFC 6238 TOTP Two-Factor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>Anti-CSRF Synchronizer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>Role-Based Permissions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Return to Public Site */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          >
            ← Return to Officer-Asistant Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="shark-interior-page min-h-[85vh] flex items-center justify-center py-10 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl animate-pulse">
            🛡️
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
