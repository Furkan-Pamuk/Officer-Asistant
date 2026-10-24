import crypto from "node:crypto";

export type AdminRole = "super_admin" | "operator_admin" | "viewer_admin";

export type AdminPermission =
  | "metrics:read"
  | "activity:read"
  | "audit:export"
  | "simulate:write"
  | "data:reset"
  | "admin:manage";

export interface AdminSession {
  id: string;
  username: string;
  role: AdminRole;
  csrfToken: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  ipAddress: string;
  userAgent: string;
}

export interface RateLimitState {
  failedAttempts: number;
  lockedUntil: number;
  lastAttempt: number;
  requestTimestamps: number[];
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  event: "login_success" | "login_failed" | "login_locked" | "logout" | "unauthorized_access" | "csrf_failure" | "ip_blocked";
  ipAddress: string;
  userAgent: string;
  username?: string;
  role?: string;
  details?: string;
}

// Security Configuration
const CONFIG = {
  cookieName: process.env.NODE_ENV === "production" ? "__Host-shark_admin_session" : "shark_admin_session",
  fallbackCookieName: "shark_admin_session",
  sessionSecret: process.env.ADMIN_SESSION_SECRET || "shark-maritime-admin-defense-key-2026-hyper-secure",
  defaultUsername: process.env.ADMIN_USERNAME || "sharkadmin",
  defaultPassword: process.env.ADMIN_PASSWORD || "Shark@MasterNav2026!",
  mfaSecret: process.env.ADMIN_MFA_SECRET || "JBSWY3DPEHPK3PXP", // Base32 test key
  mfaBackupCode: process.env.ADMIN_MFA_BACKUP_CODE || "748921",
  mfaEnabled: process.env.ADMIN_MFA_ENABLED !== "false",
  allowedIps: process.env.ADMIN_ALLOWED_IPS || "*", // "*" allows any IP; or comma-separated list
  directPath: process.env.ADMIN_DIRECT_PATH || "/admin",
  maxFailedLogins: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes lockout
  sessionAbsoluteLifetimeMs: 8 * 60 * 60 * 1000, // 8 hours absolute
  sessionIdleTimeoutMs: 60 * 60 * 1000, // 60 minutes idle
};

// Role Permission Map
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "metrics:read",
    "activity:read",
    "audit:export",
    "simulate:write",
    "data:reset",
    "admin:manage",
  ],
  operator_admin: [
    "metrics:read",
    "activity:read",
    "audit:export",
    "simulate:write",
  ],
  viewer_admin: [
    "metrics:read",
    "activity:read",
    "audit:export",
  ],
};

// Server-side In-Memory Store
interface ServerSecurityMemory {
  sessions: Map<string, AdminSession>;
  rateLimits: Map<string, RateLimitState>;
  auditLog: SecurityAuditEntry[];
}

const memoryStore: ServerSecurityMemory =
  (globalThis as unknown as { __sharkSecurityMemory?: ServerSecurityMemory }).__sharkSecurityMemory || {
    sessions: new Map(),
    rateLimits: new Map(),
    auditLog: [],
  };
(globalThis as unknown as { __sharkSecurityMemory?: ServerSecurityMemory }).__sharkSecurityMemory = memoryStore;

// -------------------------------------------------------------
// Rate Limiting & Brute Force Prevention
// -------------------------------------------------------------

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const list = forwarded.split(",").map((s) => s.trim());
    if (list[0]) return list[0];
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingSeconds: number; failedAttempts: number } {
  const now = Date.now();
  const state = memoryStore.rateLimits.get(ip);

  if (!state) {
    return { allowed: true, remainingSeconds: 0, failedAttempts: 0 };
  }

  if (state.lockedUntil > now) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds, failedAttempts: state.failedAttempts };
  }

  // Reset lock if duration elapsed
  if (state.lockedUntil > 0 && state.lockedUntil <= now) {
    state.lockedUntil = 0;
    state.failedAttempts = 0;
  }

  return { allowed: true, remainingSeconds: 0, failedAttempts: state.failedAttempts };
}

export function recordLoginFailure(ip: string, userAgent = "", username = ""): { locked: boolean; remainingSeconds: number; attempts: number } {
  const now = Date.now();
  let state = memoryStore.rateLimits.get(ip);

  if (!state) {
    state = {
      failedAttempts: 1,
      lockedUntil: 0,
      lastAttempt: now,
      requestTimestamps: [now],
    };
    memoryStore.rateLimits.set(ip, state);
  } else {
    // If last attempt was more than 30 mins ago, reset count
    if (now - state.lastAttempt > 30 * 60 * 1000 && state.lockedUntil <= now) {
      state.failedAttempts = 1;
    } else {
      state.failedAttempts += 1;
    }
    state.lastAttempt = now;
  }

  let locked = false;
  let remainingSeconds = 0;

  if (state.failedAttempts >= CONFIG.maxFailedLogins) {
    state.lockedUntil = now + CONFIG.lockoutDurationMs;
    locked = true;
    remainingSeconds = Math.ceil(CONFIG.lockoutDurationMs / 1000);

    logSecurityEvent({
      event: "login_locked",
      ipAddress: ip,
      userAgent,
      username,
      details: `Client IP temporarily locked for 15 minutes after ${state.failedAttempts} failed attempts.`,
    });
  } else {
    logSecurityEvent({
      event: "login_failed",
      ipAddress: ip,
      userAgent,
      username,
      details: `Failed attempt ${state.failedAttempts} of ${CONFIG.maxFailedLogins}.`,
    });
  }

  return { locked, remainingSeconds, attempts: state.failedAttempts };
}

export function recordLoginSuccess(ip: string): void {
  const state = memoryStore.rateLimits.get(ip);
  if (state) {
    state.failedAttempts = 0;
    state.lockedUntil = 0;
  }
}

export function checkApiRateLimit(key: string, maxRequests = 120, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let state = memoryStore.rateLimits.get(key);

  if (!state) {
    state = {
      failedAttempts: 0,
      lockedUntil: 0,
      lastAttempt: now,
      requestTimestamps: [now],
    };
    memoryStore.rateLimits.set(key, state);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Filter timestamps within window
  state.requestTimestamps = state.requestTimestamps.filter((t) => now - t < windowMs);
  state.requestTimestamps.push(now);

  const count = state.requestTimestamps.length;
  if (count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: Math.max(0, maxRequests - count) };
}

// -------------------------------------------------------------
// IP Whitelisting
// -------------------------------------------------------------

export function isIpAllowed(clientIp: string): boolean {
  if (CONFIG.allowedIps === "*" || !CONFIG.allowedIps.trim()) {
    return true;
  }

  // Normalize IPv6-mapped IPv4
  const normalized = clientIp.replace(/^::ffff:/, "").trim();

  // Always permit local loopback for local admin operations
  if (normalized === "127.0.0.1" || normalized === "::1" || normalized === "localhost") {
    return true;
  }

  const allowedList = CONFIG.allowedIps
    .split(",")
    .map((item) => item.trim().replace(/^::ffff:/, ""))
    .filter(Boolean);

  for (const allowed of allowedList) {
    if (allowed === normalized) return true;
    // Simple CIDR / prefix match (e.g. 192.168.1.)
    if (allowed.endsWith(".") && normalized.startsWith(allowed)) return true;
    if (allowed.includes("/")) {
      const [subnet] = allowed.split("/");
      if (subnet && normalized.startsWith(subnet.split(".").slice(0, 3).join("."))) {
        return true;
      }
    }
  }

  return false;
}

// -------------------------------------------------------------
// Cryptographic Password Verification
// -------------------------------------------------------------

export function verifyPassword(provided: string): boolean {
  const target = CONFIG.defaultPassword;
  const providedBuffer = crypto.createHash("sha256").update(provided).digest();
  const targetBuffer = crypto.createHash("sha256").update(target).digest();

  return crypto.timingSafeEqual(providedBuffer, targetBuffer);
}

export function verifyUsername(provided: string): boolean {
  const target = CONFIG.defaultUsername;
  const providedBuffer = crypto.createHash("sha256").update(provided.toLowerCase().trim()).digest();
  const targetBuffer = crypto.createHash("sha256").update(target.toLowerCase().trim()).digest();

  return crypto.timingSafeEqual(providedBuffer, targetBuffer);
}

// -------------------------------------------------------------
// RFC 6238 Time-based One-Time Password (TOTP)
// -------------------------------------------------------------

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32ToBuffer(base32Str: string): Buffer {
  const clean = base32Str.toUpperCase().replace(/=+$/, "").replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpCode(secretBase32: string, counterOffset = 0): string {
  const key = base32ToBuffer(secretBase32);
  const timeStep = 30;
  const counter = Math.floor(Date.now() / 1000 / timeStep) + counterOffset;

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (codeInt % 1000000).toString().padStart(6, "0");
}

export function verifyMfaCode(providedCode: string): boolean {
  if (!CONFIG.mfaEnabled) {
    return true;
  }

  const clean = providedCode.trim().replace(/\s+/g, "");

  // Emergency Master Backup Code Check
  if (clean === CONFIG.mfaBackupCode) {
    return true;
  }

  // RFC 6238 TOTP verification with window of ±1 step (covers 90 seconds)
  for (let offset = -1; offset <= 1; offset++) {
    const validCode = generateTotpCode(CONFIG.mfaSecret, offset);
    if (clean.length === validCode.length) {
      const b1 = Buffer.from(clean);
      const b2 = Buffer.from(validCode);
      if (crypto.timingSafeEqual(b1, b2)) {
        return true;
      }
    }
  }

  return false;
}

export function getMfaSetupInfo(): { enabled: boolean; backupCodeHint: string; currentSampleCode?: string; secret?: string } {
  const isDevHelper = process.env.NODE_ENV !== "production" && process.env.ADMIN_DEV_HELPER === "true";
  return {
    enabled: CONFIG.mfaEnabled,
    backupCodeHint: CONFIG.mfaBackupCode.slice(0, 2) + "**" + CONFIG.mfaBackupCode.slice(-2),
    ...(isDevHelper
      ? {
          secret: CONFIG.mfaSecret,
          currentSampleCode: generateTotpCode(CONFIG.mfaSecret, 0),
        }
      : {}),
  };
}

// -------------------------------------------------------------
// Role-Based Access Control (RBAC)
// -------------------------------------------------------------

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

// -------------------------------------------------------------
// Anti-CSRF Token
// -------------------------------------------------------------

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCsrfToken(expected: string, provided?: string | null): boolean {
  if (!provided || typeof provided !== "string") return false;
  if (expected.length !== provided.length) return false;

  const b1 = Buffer.from(expected);
  const b2 = Buffer.from(provided);
  return crypto.timingSafeEqual(b1, b2);
}

// -------------------------------------------------------------
// Session Management with Signed HTTP-Only Cookies
// -------------------------------------------------------------

export function signSessionId(sessionId: string): string {
  const hmac = crypto.createHmac("sha256", CONFIG.sessionSecret).update(sessionId).digest("hex");
  return `${sessionId}.${hmac}`;
}

export function verifySessionId(signedToken: string): string | null {
  const parts = signedToken.split(".");
  if (parts.length !== 2) return null;
  const [sessionId, hmac] = parts;
  if (!sessionId || !hmac) return null;

  const expectedHmac = crypto.createHmac("sha256", CONFIG.sessionSecret).update(sessionId).digest("hex");
  if (hmac.length !== expectedHmac.length) return null;

  const b1 = Buffer.from(hmac);
  const b2 = Buffer.from(expectedHmac);
  if (!crypto.timingSafeEqual(b1, b2)) return null;

  return sessionId;
}

export function createSession(params: {
  username: string;
  role: AdminRole;
  ipAddress: string;
  userAgent: string;
}): { session: AdminSession; cookieValue: string } {
  const now = Date.now();
  const sessionId = crypto.randomBytes(32).toString("hex");
  const csrfToken = generateCsrfToken();

  const session: AdminSession = {
    id: sessionId,
    username: params.username,
    role: params.role,
    csrfToken,
    createdAt: now,
    expiresAt: now + CONFIG.sessionAbsoluteLifetimeMs,
    lastActivityAt: now,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  };

  memoryStore.sessions.set(sessionId, session);

  logSecurityEvent({
    event: "login_success",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    username: params.username,
    role: params.role,
    details: `Authenticated with role ${params.role}.`,
  });

  return {
    session,
    cookieValue: signSessionId(sessionId),
  };
}

export function getSession(signedToken?: string | null): AdminSession | null {
  if (!signedToken) return null;
  const sessionId = verifySessionId(signedToken);
  if (!sessionId) return null;

  const session = memoryStore.sessions.get(sessionId);
  if (!session) return null;

  const now = Date.now();

  // Absolute expiry check
  if (now > session.expiresAt) {
    memoryStore.sessions.delete(sessionId);
    return null;
  }

  // Idle timeout check
  if (now - session.lastActivityAt > CONFIG.sessionIdleTimeoutMs) {
    memoryStore.sessions.delete(sessionId);
    return null;
  }

  // Update last activity
  session.lastActivityAt = now;
  return session;
}

export function destroySession(signedToken?: string | null): void {
  if (!signedToken) return;
  const sessionId = verifySessionId(signedToken);
  if (!sessionId) return;

  const session = memoryStore.sessions.get(sessionId);
  if (session) {
    logSecurityEvent({
      event: "logout",
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      username: session.username,
      role: session.role,
      details: "Admin session gracefully closed.",
    });
    memoryStore.sessions.delete(sessionId);
  }
}

// -------------------------------------------------------------
// Security Audit Logging
// -------------------------------------------------------------

export function logSecurityEvent(event: Omit<SecurityAuditEntry, "id" | "timestamp">): void {
  const entry: SecurityAuditEntry = {
    id: `sec_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  memoryStore.auditLog.unshift(entry);
  if (memoryStore.auditLog.length > 200) {
    memoryStore.auditLog.pop();
  }
}

export function getSecurityAuditLogs(limit = 50): SecurityAuditEntry[] {
  return memoryStore.auditLog.slice(0, limit);
}

// -------------------------------------------------------------
// Security Headers & Cookie Constants
// -------------------------------------------------------------

export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, private",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}

export function getCookieNames(): { primary: string; fallback: string } {
  return {
    primary: CONFIG.cookieName,
    fallback: CONFIG.fallbackCookieName,
  };
}

export function getAdminConfig() {
  return {
    mfaEnabled: CONFIG.mfaEnabled,
    allowedIpsConfigured: CONFIG.allowedIps !== "*",
    maxFailedLogins: CONFIG.maxFailedLogins,
    lockoutDurationMinutes: Math.round(CONFIG.lockoutDurationMs / 60000),
  };
}
