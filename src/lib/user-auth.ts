import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
}

// -------------------------------------------------------------
// Constants
// -------------------------------------------------------------

export const USER_COOKIE_NAME = "shark_user_session";

const SESSION_SECRET =
  process.env.USER_SESSION_SECRET || "shark-user-session-key-2026";

const SESSION_ABSOLUTE_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours

const MAX_FAILED_LOGINS = 10;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// -------------------------------------------------------------
// In-Memory Store (survives HMR via globalThis)
// -------------------------------------------------------------

interface UserMemoryStore {
  users: Map<string, UserAccount>;
  emailIndex: Map<string, string>; // email → user id
  sessions: Map<string, UserSession>;
  loginFailures: Map<string, { count: number; lockedUntil: number; lastAttempt: number }>;
}

const memoryStore: UserMemoryStore =
  (globalThis as unknown as { __sharkUserMemory?: UserMemoryStore }).__sharkUserMemory || {
    users: new Map(),
    emailIndex: new Map(),
    sessions: new Map(),
    loginFailures: new Map(),
  };
(globalThis as unknown as { __sharkUserMemory?: UserMemoryStore }).__sharkUserMemory = memoryStore;

// -------------------------------------------------------------
// Durable File-Based Persistence
// -------------------------------------------------------------

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

const DATA_FILE_PATH =
  process.env.USER_DATA_FILE ||
  (IS_SERVERLESS
    ? path.join("/tmp", "users.json")
    : path.join(process.cwd(), ".data", "users.json"));

function persistToDisk(): void {
  try {
    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    }
    const payload = {
      users: Array.from(memoryStore.users.values()),
      sessions: Array.from(memoryStore.sessions.values()),
    };
    const tmp = `${DATA_FILE_PATH}.tmp.${crypto.randomBytes(4).toString("hex")}`;
    fs.writeFileSync(/*turbopackIgnore: true*/ tmp, JSON.stringify(payload, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, DATA_FILE_PATH);
  } catch (err) {
    console.warn("[user-auth] Unable to persist to disk:", err);
  }
}

function loadFromDisk(): void {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ DATA_FILE_PATH)) return;
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ DATA_FILE_PATH, "utf-8");
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.users)) {
      for (const u of parsed.users) {
        if (u && u.id && u.email) {
          memoryStore.users.set(u.id, u);
          memoryStore.emailIndex.set(u.email.toLowerCase().trim(), u.id);
        }
      }
    }
    if (Array.isArray(parsed.sessions)) {
      const now = Date.now();
      for (const s of parsed.sessions) {
        if (s && s.id && s.expiresAt > now) {
          memoryStore.sessions.set(s.id, s);
        }
      }
    }
  } catch (err) {
    console.warn("[user-auth] Unable to load from disk:", err);
  }
}

const diskLoaded =
  (globalThis as unknown as { __sharkUserDiskLoaded?: boolean }).__sharkUserDiskLoaded || false;
if (!diskLoaded) {
  loadFromDisk();
  (globalThis as unknown as { __sharkUserDiskLoaded?: boolean }).__sharkUserDiskLoaded = true;
}

// -------------------------------------------------------------
// Password Helpers
// -------------------------------------------------------------

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(salt + password).digest("hex");
}

// -------------------------------------------------------------
// User Registration
// -------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function registerUser(
  email: string,
  password: string,
  displayName: string,
): { success: boolean; error?: string; user?: { id: string; email: string; displayName: string } } {
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, error: "Invalid email format." };
  }

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const trimmedName = displayName?.trim();
  if (!trimmedName) {
    return { success: false, error: "Display name is required." };
  }

  if (memoryStore.emailIndex.has(normalizedEmail)) {
    return { success: false, error: "An account with this email already exists." };
  }

  const id = crypto.randomUUID();
  const salt = generateSalt();
  const now = new Date().toISOString();

  const user: UserAccount = {
    id,
    email: normalizedEmail,
    displayName: trimmedName,
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    createdAt: now,
    updatedAt: now,
  };

  memoryStore.users.set(id, user);
  memoryStore.emailIndex.set(normalizedEmail, id);
  persistToDisk();

  return {
    success: true,
    user: { id, email: normalizedEmail, displayName: trimmedName },
  };
}

// -------------------------------------------------------------
// User Authentication
// -------------------------------------------------------------

export function authenticateUser(
  email: string,
  password: string,
): { success: boolean; error?: string; user?: UserAccount } {
  const normalizedEmail = email.toLowerCase().trim();
  const userId = memoryStore.emailIndex.get(normalizedEmail);

  if (!userId) {
    return { success: false, error: "Invalid email or password." };
  }

  const user = memoryStore.users.get(userId);
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const candidateHash = hashPassword(password, user.passwordSalt);

  // Timing-safe comparison
  const b1 = Buffer.from(candidateHash);
  const b2 = Buffer.from(user.passwordHash);
  if (b1.length !== b2.length || !crypto.timingSafeEqual(b1, b2)) {
    return { success: false, error: "Invalid email or password." };
  }

  return { success: true, user };
}

// -------------------------------------------------------------
// Rate Limiting (login failures per IP)
// -------------------------------------------------------------

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const state = memoryStore.loginFailures.get(ip);

  if (!state) {
    return { allowed: true, retryAfter: 0 };
  }

  if (state.lockedUntil > now) {
    const retryAfter = Math.ceil((state.lockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Reset if lockout has elapsed
  if (state.lockedUntil > 0 && state.lockedUntil <= now) {
    state.lockedUntil = 0;
    state.count = 0;
  }

  return { allowed: true, retryAfter: 0 };
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  let state = memoryStore.loginFailures.get(ip);

  if (!state) {
    state = { count: 1, lockedUntil: 0, lastAttempt: now };
    memoryStore.loginFailures.set(ip, state);
  } else {
    // Reset count if last attempt was over 30 minutes ago and not locked
    if (now - state.lastAttempt > 30 * 60 * 1000 && state.lockedUntil <= now) {
      state.count = 1;
    } else {
      state.count += 1;
    }
    state.lastAttempt = now;
  }

  if (state.count >= MAX_FAILED_LOGINS) {
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
}

export function clearLoginFailures(ip: string): void {
  const state = memoryStore.loginFailures.get(ip);
  if (state) {
    state.count = 0;
    state.lockedUntil = 0;
  }
}

// -------------------------------------------------------------
// Session Management
// -------------------------------------------------------------

function signToken(sessionId: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(sessionId).digest("hex");
  return `${sessionId}.${hmac}`;
}

function verifyToken(signedToken: string): string | null {
  const parts = signedToken.split(".");
  if (parts.length !== 2) return null;
  const [sessionId, hmac] = parts;
  if (!sessionId || !hmac) return null;

  const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(sessionId).digest("hex");
  if (hmac.length !== expectedHmac.length) return null;

  const b1 = Buffer.from(hmac);
  const b2 = Buffer.from(expectedHmac);
  if (!crypto.timingSafeEqual(b1, b2)) return null;

  return sessionId;
}

export function createUserSession(
  userId: string,
  email: string,
  displayName: string,
): { session: UserSession; cookieValue: string } {
  const now = Date.now();
  const sessionId = crypto.randomBytes(32).toString("hex");

  const session: UserSession = {
    id: sessionId,
    userId,
    email,
    displayName,
    createdAt: now,
    expiresAt: now + SESSION_ABSOLUTE_LIFETIME_MS,
    lastActivityAt: now,
  };

  memoryStore.sessions.set(sessionId, session);
  persistToDisk();

  return {
    session,
    cookieValue: signToken(sessionId),
  };
}

export function getUserSession(signedToken?: string | null): UserSession | null {
  if (!signedToken) return null;
  const sessionId = verifyToken(signedToken);
  if (!sessionId) return null;

  const session = memoryStore.sessions.get(sessionId);
  if (!session) return null;

  const now = Date.now();

  // Absolute expiry
  if (now > session.expiresAt) {
    memoryStore.sessions.delete(sessionId);
    persistToDisk();
    return null;
  }

  // Idle timeout
  if (now - session.lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
    memoryStore.sessions.delete(sessionId);
    persistToDisk();
    return null;
  }

  // Refresh activity timestamp
  session.lastActivityAt = now;
  return session;
}

export function destroyUserSession(signedToken?: string | null): void {
  if (!signedToken) return;
  const sessionId = verifyToken(signedToken);
  if (!sessionId) return;
  memoryStore.sessions.delete(sessionId);
  persistToDisk();
}

// -------------------------------------------------------------
// IP Helper (matches admin-auth pattern)
// -------------------------------------------------------------

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const list = forwarded.split(",").map((s) => s.trim());
    if (list[0]) return list[0];
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}
