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

function getSessionSecret(): string {
  const configured = process.env.USER_SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  const isDefaultOrEmpty = !configured || configured === "shark-user-session-key-2026";

  if (isProduction && isDefaultOrEmpty) {
    const globalStore = globalThis as unknown as { __sharkEphemeralUserSessionSecret?: string };
    if (!globalStore.__sharkEphemeralUserSessionSecret) {
      globalStore.__sharkEphemeralUserSessionSecret = crypto.randomBytes(32).toString("hex");
      console.warn(
        "[user-auth] WARNING: USER_SESSION_SECRET is unset or using default fallback in production. Generated high-entropy ephemeral secret for process lifetime.",
      );
    }
    return globalStore.__sharkEphemeralUserSessionSecret;
  }

  return configured || "shark-user-session-key-2026";
}

const SESSION_ABSOLUTE_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours

const MAX_FAILED_LOGINS = 10;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const MAX_REGISTRATIONS_PER_HOUR = 5;
export const REGISTER_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// -------------------------------------------------------------
// In-Memory Store (survives HMR via globalThis)
// -------------------------------------------------------------

interface UserMemoryStore {
  users: Map<string, UserAccount>;
  emailIndex: Map<string, string>; // email → user id
  sessions: Map<string, UserSession>;
  loginFailures: Map<string, { count: number; lockedUntil: number; lastAttempt: number }>;
  registerAttempts: Map<string, number[]>;
}

const memoryStore: UserMemoryStore =
  (globalThis as unknown as { __sharkUserMemory?: UserMemoryStore }).__sharkUserMemory || {
    users: new Map(),
    emailIndex: new Map(),
    sessions: new Map(),
    loginFailures: new Map(),
    registerAttempts: new Map(),
  };
if (!memoryStore.registerAttempts) {
  memoryStore.registerAttempts = new Map();
}
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

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";
const PBKDF2_PREFIX = `pbkdf2$${PBKDF2_ITERATIONS}$`;

export function generateSalt(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  const derived = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return `${PBKDF2_PREFIX}${derived}`;
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
  if (typeof email !== "string") {
    return { success: false, error: "Invalid email format." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || normalizedEmail.length > 254 || !EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, error: "Invalid email format." };
  }

  if (typeof password !== "string" || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  if (password.length > 128) {
    return { success: false, error: "Password must not exceed 128 characters." };
  }

  if (typeof displayName !== "string") {
    return { success: false, error: "Display name is required." };
  }

  const sanitizedDisplayName = displayName
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();

  if (!sanitizedDisplayName) {
    return { success: false, error: "Display name is required." };
  }

  if (sanitizedDisplayName.length > 60) {
    return { success: false, error: "Display name must not exceed 60 characters." };
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
    displayName: sanitizedDisplayName,
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
    user: { id, email: normalizedEmail, displayName: sanitizedDisplayName },
  };
}

// -------------------------------------------------------------
// User Authentication
// -------------------------------------------------------------

export function authenticateUser(
  email: string,
  password: string,
): { success: boolean; error?: string; user?: UserAccount } {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return { success: false, error: "Invalid email or password." };
  }

  if (typeof email !== "string") {
    return { success: false, error: "Invalid email or password." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userId = memoryStore.emailIndex.get(normalizedEmail);

  if (!userId) {
    return { success: false, error: "Invalid email or password." };
  }

  const user = memoryStore.users.get(userId);
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  // 1. Check if hash matches PBKDF2 signature
  if (user.passwordHash.startsWith(PBKDF2_PREFIX)) {
    const candidateHash = hashPassword(password, user.passwordSalt);
    const b1 = Buffer.from(candidateHash);
    const b2 = Buffer.from(user.passwordHash);
    if (b1.length !== b2.length || !crypto.timingSafeEqual(b1, b2)) {
      return { success: false, error: "Invalid email or password." };
    }
    return { success: true, user };
  }

  // 2. Legacy SHA-256 fallback check (64 hex characters and not matching PBKDF2 signature)
  const isLegacySha256 = /^[0-9a-f]{64}$/i.test(user.passwordHash);
  if (isLegacySha256) {
    const legacyCandidate = crypto
      .createHash("sha256")
      .update(user.passwordSalt + password)
      .digest("hex");
    const b1 = Buffer.from(legacyCandidate);
    const b2 = Buffer.from(user.passwordHash);
    if (b1.length === b2.length && crypto.timingSafeEqual(b1, b2)) {
      // Re-hash transparently with PBKDF2 and new 32-byte salt
      const newSalt = generateSalt();
      const newHash = hashPassword(password, newSalt);
      user.passwordSalt = newSalt;
      user.passwordHash = newHash;
      user.updatedAt = new Date().toISOString();
      persistToDisk();
      return { success: true, user };
    }
  }

  return { success: false, error: "Invalid email or password." };
}

// -------------------------------------------------------------
// Rate Limiting (login failures and registrations per IP)
// -------------------------------------------------------------

export function checkRegisterRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const attempts = memoryStore.registerAttempts?.get(ip) || [];
  const recent = attempts.filter((ts) => now - ts < REGISTER_RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REGISTRATIONS_PER_HOUR) {
    const oldest = recent[0];
    const retryAfter = Math.ceil((oldest + REGISTER_RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  return { allowed: true, retryAfter: 0 };
}

export function recordRegisterAttempt(ip: string): void {
  const now = Date.now();
  if (!memoryStore.registerAttempts) {
    memoryStore.registerAttempts = new Map();
  }
  const attempts = memoryStore.registerAttempts.get(ip) || [];
  const recent = attempts.filter((ts) => now - ts < REGISTER_RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  memoryStore.registerAttempts.set(ip, recent);
}

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
  const secret = getSessionSecret();
  const hmac = crypto.createHmac("sha256", secret).update(sessionId).digest("hex");
  return `${sessionId}.${hmac}`;
}

function verifyToken(signedToken: string): string | null {
  const parts = signedToken.split(".");
  if (parts.length !== 2) return null;
  const [sessionId, hmac] = parts;
  if (!sessionId || !hmac) return null;

  const secret = getSessionSecret();
  const expectedHmac = crypto.createHmac("sha256", secret).update(sessionId).digest("hex");
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
