"use client";
import { useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

/** Routes that do not require authentication. */
const PUBLIC_PATHS = ["/login", "/privacy", "/terms", "/contact", "/faq", "/links"];
/** Prefix-based public routes (e.g. /about, /about/team, /admin). */
const PUBLIC_PREFIXES = ["/about", "/pricing", "/news", "/admin", "/api"];

function isPublicPath(pathname: string | null): boolean {
  if (!pathname || pathname === "/") return true;
  if (PUBLIC_PATHS.includes(pathname)) return true;
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return true;
  }
  return false;
}

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPath(pathname)) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  // While loading auth state, render nothing for protected routes.
  if (loading && !isPublicPath(pathname)) {
    return null;
  }

  // Not authenticated on a protected route — render nothing while redirecting.
  if (!loading && !user && !isPublicPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <AuthGateInner>{children}</AuthGateInner>
      </Suspense>
    </AuthProvider>
  );
}
