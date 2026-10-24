"use client";
import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { createElement } from "react";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  /** Re-check session status from the server. */
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        const u = data.authenticated ? data.user : null;
        setUser(u);
        if (u) {
          try {
            localStorage.setItem("shark_cached_user", JSON.stringify(u));
            localStorage.setItem("shark-intro-seen", "1");
          } catch {}
        } else {
          try {
            localStorage.removeItem("shark_cached_user");
          } catch {}
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem("shark_cached_user");
        } catch {}
      }
    } catch {
      // Offline or network error — fall back to cached user
      try {
        const cached = localStorage.getItem("shark_cached_user");
        if (cached) setUser(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    try {
      localStorage.removeItem("shark_cached_user");
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem("shark_cached_user", JSON.stringify(data.user));
            localStorage.setItem("shark-intro-seen", "1");
          } catch {}
        } else {
          setUser(null);
          try {
            localStorage.removeItem("shark_cached_user");
          } catch {}
        }
      })
      .catch(() => {
        // Offline or network error — keep existing user state or read from cache to support
        // offline PWA usage after initial login.
        if (cancelled) return;
        try {
          const cached = localStorage.getItem("shark_cached_user");
          if (cached) {
            setUser(JSON.parse(cached));
          }
        } catch {}
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return createElement(AuthCtx.Provider, { value: { user, loading, refresh, logout } }, children);
}

export function useAuth(): AuthState {
  return useContext(AuthCtx);
}
