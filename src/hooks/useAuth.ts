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
        setUser(data.authenticated ? data.user : null);
      } else {
        setUser(null);
      }
    } catch {
      // Offline or network error — keep existing user state to support
      // offline PWA usage after initial login.
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setUser(data?.authenticated ? data.user : null);
      })
      .catch(() => {
        // Offline or network error — keep existing user state to support
        // offline PWA usage after initial login.
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
