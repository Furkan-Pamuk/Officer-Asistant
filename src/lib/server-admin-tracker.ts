import fs from "node:fs";
import path from "node:path";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  rank: string;
  vessel: string;
  department: "deck" | "engine" | "galley" | "other";
  avatar?: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastActiveAt: string;
  createdAt: string;
  status: "active" | "idle";
}

export interface ApiActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRank: string;
  vessel: string;
  endpoint: string;
  status: "success" | "failed";
  model: string;
  latencyMs: number;
  productId?: string;
  productName?: string;
  category?: string;
  errorMessage?: string;
  authMethod: string;
}

export interface AdminMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  activeUsersCount: number;
  totalUsersCount: number;
  totalProductsIdentified: number;
  avgLatencyMs: number;
  categoryBreakdown: Record<string, number>;
  rankBreakdown: Record<string, number>;
  endpointBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
}

export interface BreakdownEntry {
  total: number;
  success: number;
  failed: number;
  successRate: number;
  avgLatencyMs: number;
}

export interface PerUserStats {
  total: number;
  success: number;
  failed: number;
  successRate: number;
  avgLatencyMs: number;
  byEndpoint: Record<string, BreakdownEntry>;
  byModel: Record<string, BreakdownEntry>;
  byCategory: Record<string, number>;
}

export interface UserDetail {
  user: AdminUser;
  stats: PerUserStats;
  logs: ApiActivityLog[];
}

// Initial realistic crew/officer users
const INITIAL_USERS: AdminUser[] = [
  {
    id: "usr_furkan",
    name: "Furkan Pamuk",
    email: "furkan@officerassistant.app",
    rank: "Chief Officer",
    vessel: "M/V Pacific Horizon",
    department: "deck",
    totalRequests: 28,
    successfulRequests: 26,
    failedRequests: 2,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: "2026-09-01T08:00:00.000Z",
    status: "active",
  },
  {
    id: "usr_vance",
    name: "Capt. James Vance",
    email: "james.vance@pacific-maritime.com",
    rank: "Master",
    vessel: "M/V Pacific Horizon",
    department: "deck",
    totalRequests: 14,
    successfulRequests: 14,
    failedRequests: 0,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    createdAt: "2026-09-05T10:30:00.000Z",
    status: "active",
  },
  {
    id: "usr_brody",
    name: "Marcus Brody",
    email: "m.brody@global-tankers.com",
    rank: "Chief Engineer",
    vessel: "M/T Nordic Star",
    department: "engine",
    totalRequests: 19,
    successfulRequests: 17,
    failedRequests: 2,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: "2026-09-12T14:15:00.000Z",
    status: "active",
  },
  {
    id: "usr_elena",
    name: "Elena Rostova",
    email: "elena.rostova@oceanic-lines.org",
    rank: "2nd Officer",
    vessel: "M/V Atlantic Pioneer",
    department: "deck",
    totalRequests: 22,
    successfulRequests: 21,
    failedRequests: 1,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: "2026-09-15T09:40:00.000Z",
    status: "active",
  },
  {
    id: "usr_sato",
    name: "Kenji Sato",
    email: "kenji.sato@maritime-logistics.jp",
    rank: "2nd Engineer",
    vessel: "M/T Nordic Star",
    department: "engine",
    totalRequests: 11,
    successfulRequests: 10,
    failedRequests: 1,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    createdAt: "2026-09-20T11:20:00.000Z",
    status: "idle",
  },
  {
    id: "usr_rossi",
    name: "Mario Rossi",
    email: "mario.cook@pacific-maritime.com",
    rank: "Chief Cook",
    vessel: "M/V Pacific Horizon",
    department: "galley",
    totalRequests: 8,
    successfulRequests: 7,
    failedRequests: 1,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    createdAt: "2026-10-01T07:15:00.000Z",
    status: "idle",
  },
  {
    id: "usr_cadet",
    name: "Leo Miller",
    email: "leo.cadet@shark-academy.edu",
    rank: "Deck Cadet",
    vessel: "M/V Pacific Horizon",
    department: "deck",
    totalRequests: 16,
    successfulRequests: 14,
    failedRequests: 2,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    createdAt: "2026-10-10T16:00:00.000Z",
    status: "active",
  },
];

const INITIAL_LOGS: ApiActivityLog[] = [
  {
    id: "log_101",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    userId: "usr_furkan",
    userName: "Furkan Pamuk",
    userRank: "Chief Officer",
    vessel: "M/V Pacific Horizon",
    endpoint: "/api/requests/ai-identify",
    status: "success",
    model: "gemini-2.0-flash",
    latencyMs: 780,
    productId: "791821",
    productName: "CHIPPING HAMMER STEEL HANDLE 500G",
    category: "spare-deck",
    authMethod: "Google API Key (GEMINI_API_KEY)",
  },
  {
    id: "log_102",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    userId: "usr_cadet",
    userName: "Leo Miller",
    userRank: "Deck Cadet",
    vessel: "M/V Pacific Horizon",
    endpoint: "/api/requests/ai-identify",
    status: "success",
    model: "gemini-2.0-flash",
    latencyMs: 820,
    productId: "190111",
    productName: "SAFETY HELMET WHITE VENTED WITH CHINSTRAP",
    category: "spare-deck",
    authMethod: "Google API Key (GEMINI_API_KEY)",
  },
  {
    id: "log_103",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userId: "usr_elena",
    userName: "Elena Rostova",
    userRank: "2nd Officer",
    vessel: "M/V Atlantic Pioneer",
    endpoint: "/api/requests/ai-identify",
    status: "success",
    model: "gemini-2.0-flash",
    latencyMs: 690,
    productId: "232011",
    productName: "BALLPOINT PEN BLUE MEDIUM 0.7MM",
    category: "stationery",
    authMethod: "Google API Key (GOOGLE_API_KEY)",
  },
  {
    id: "log_104",
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    userId: "usr_vance",
    userName: "Capt. James Vance",
    userRank: "Master",
    vessel: "M/V Pacific Horizon",
    endpoint: "/api/requests/ai-identify",
    status: "success",
    model: "gemini-2.0-flash",
    latencyMs: 710,
    productId: "370211",
    productName: "NAUTICAL SEXTANT WITH WOODEN BOX",
    category: "spare-deck",
    authMethod: "Google API Key (GEMINI_API_KEY)",
  },
  {
    id: "log_105",
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    userId: "usr_brody",
    userName: "Marcus Brody",
    userRank: "Chief Engineer",
    vessel: "M/T Nordic Star",
    endpoint: "/api/requests/ai-identify",
    status: "failed",
    model: "gemini-2.0-flash",
    latencyMs: 540,
    errorMessage: "No catalog match found for blurry image. Please retake photo.",
    authMethod: "Google API Key (GEMINI_API_KEY)",
  },
];

// Seed baselines: INITIAL_USERS totals already include INITIAL_LOGS activity,
// so reconciled totals = baseline + (current logs - initial logs for that user).
// This keeps seed history (e.g. 28) and makes the first tracked request increment (28->29).
const SEED_BASELINE: Record<string, { total: number; success: number; failed: number }> = {};
for (const u of INITIAL_USERS) {
  SEED_BASELINE[u.id] = {
    total: u.totalRequests,
    success: u.successfulRequests,
    failed: u.failedRequests,
  };
}

const SEED_INITIAL_LOG_COUNT: Record<string, { total: number; success: number; failed: number }> = {};
for (const l of INITIAL_LOGS) {
  const c = (SEED_INITIAL_LOG_COUNT[l.userId] = SEED_INITIAL_LOG_COUNT[l.userId] || {
    total: 0,
    success: 0,
    failed: 0,
  });
  c.total += 1;
  if (l.status === "success") c.success += 1;
  else c.failed += 1;
}

// Persistent state storage in memory with backup to data folder
class AdminTrackerStore {
  private users: AdminUser[] = [...INITIAL_USERS];
  private logs: ApiActivityLog[] = [...INITIAL_LOGS];
  private storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), "public", "third-party", "admin-tracker.json");
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          this.users = parsed.users;
        }
        if (Array.isArray(parsed.logs) && parsed.logs.length > 0) {
          this.logs = parsed.logs;
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  private saveToDisk() {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        this.storagePath,
        JSON.stringify({ users: this.users, logs: this.logs.slice(0, 500) }, null, 2),
        "utf-8"
      );
    } catch {
      // Ignore write errors
    }
  }

  public getUsers(): AdminUser[] {
    return this.getReconciledUsers();
  }

  public getLogs(limit = 100): ApiActivityLog[] {
    return [...this.logs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public getLogsForUser(userId: string, limit = 100): ApiActivityLog[] {
    return this.logs
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Reconciliation: INITIAL_USERS totals are the baseline (they already include
   * INITIAL_LOGS), plus the delta of logs tracked since baseline.
   * First tracked request increments (28->29), never wipes seed history.
   */
  public getReconciledUsers(): AdminUser[] {
    return this.users
      .map((u) => {
        const userLogs = this.logs.filter((l) => l.userId === u.id);
        const baseline = SEED_BASELINE[u.id];
        // Unknown (newly created) users have no seed baseline — use stored counters.
        if (!baseline) return { ...u };
        const initial = SEED_INITIAL_LOG_COUNT[u.id] || { total: 0, success: 0, failed: 0 };
        const success = userLogs.filter((l) => l.status === "success").length;
        const failed = userLogs.length - success;
        const newest = [...userLogs].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        // Clamp deltas at 0 so trimmed/persisted logs can never drop below baseline.
        const total = baseline.total + Math.max(0, userLogs.length - initial.total);
        const reconciledSuccess = baseline.success + Math.max(0, success - initial.success);
        const reconciledFailed = baseline.failed + Math.max(0, failed - initial.failed);
        return {
          ...u,
          totalRequests: Math.max(u.totalRequests, total),
          successfulRequests: Math.max(u.successfulRequests, reconciledSuccess),
          failedRequests: Math.max(u.failedRequests, reconciledFailed),
          lastActiveAt:
            newest && newest.timestamp > u.lastActiveAt ? newest.timestamp : u.lastActiveAt,
        };
      })
      .sort((a, b) => b.totalRequests - a.totalRequests);
  }

  public getPerUserStats(userId: string): PerUserStats | null {
    const stored = this.users.find((u) => u.id === userId);
    if (!stored) return null;
    const userLogs = this.logs.filter((l) => l.userId === userId);

    const logSuccess = userLogs.filter((l) => l.status === "success").length;
    const logFailed = userLogs.length - logSuccess;
    const totalLatency = userLogs.reduce((acc, l) => acc + (l.latencyMs || 0), 0);

    // Totals match getReconciledUsers(): seed baseline + delta since baseline.
    const baseline = SEED_BASELINE[userId];
    let total: number;
    let success: number;
    let failed: number;
    if (!baseline) {
      total = stored.totalRequests;
      success = stored.successfulRequests;
      failed = stored.failedRequests;
    } else {
      const initial = SEED_INITIAL_LOG_COUNT[userId] || { total: 0, success: 0, failed: 0 };
      total = Math.max(
        stored.totalRequests,
        baseline.total + Math.max(0, userLogs.length - initial.total)
      );
      success = Math.max(
        stored.successfulRequests,
        baseline.success + Math.max(0, logSuccess - initial.success)
      );
      failed = Math.max(
        stored.failedRequests,
        baseline.failed + Math.max(0, logFailed - initial.failed)
      );
    }

    const groupBy = (key: (l: ApiActivityLog) => string) => {
      const groups: Record<string, ApiActivityLog[]> = {};
      for (const log of userLogs) {
        const k = key(log) || "unknown";
        (groups[k] = groups[k] || []).push(log);
      }
      const out: Record<string, BreakdownEntry> = {};
      for (const [k, items] of Object.entries(groups)) {
        const s = items.filter((i) => i.status === "success").length;
        const f = items.length - s;
        const lat = items.reduce((acc, i) => acc + (i.latencyMs || 0), 0);
        out[k] = {
          total: items.length,
          success: s,
          failed: f,
          successRate: items.length > 0 ? Math.round((s / items.length) * 100) : 100,
          avgLatencyMs: items.length > 0 ? Math.round(lat / items.length) : 0,
        };
      }
      return out;
    };

    const byCategory: Record<string, number> = {};
    for (const log of userLogs) {
      if (log.status === "success") {
        const cat = log.category || "other";
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
    }

    return {
      total,
      success,
      failed,
      successRate: total > 0 ? Math.round((success / total) * 100) : 100,
      avgLatencyMs: userLogs.length > 0 ? Math.round(totalLatency / userLogs.length) : 0,
      byEndpoint: groupBy((l) => l.endpoint),
      byModel: groupBy((l) => l.model),
      byCategory,
    };
  }

  public getUserDetail(userId: string): UserDetail | null {
    const reconciled = this.getReconciledUsers().find((u) => u.id === userId);
    if (!reconciled) return null;
    const stats = this.getPerUserStats(userId);
    if (!stats) return null;
    return { user: reconciled, stats, logs: this.getLogsForUser(userId, 100) };
  }

  public trackApiRequest(entry: {
    userId?: string;
    userName?: string;
    userRank?: string;
    vessel?: string;
    endpoint: string;
    status: "success" | "failed";
    model: string;
    latencyMs: number;
    productId?: string;
    productName?: string;
    category?: string;
    errorMessage?: string;
    authMethod: string;
  }) {
    const userId = entry.userId || "usr_furkan";
    const userName = entry.userName || "Furkan Pamuk";
    const userRank = entry.userRank || "Chief Officer";
    const vessel = entry.vessel || "M/V Pacific Horizon";

    // 1. Find or create user
    let user = this.users.find((u) => u.id === userId || u.name.toLowerCase() === userName.toLowerCase());
    if (!user) {
      user = {
        id: userId,
        name: userName,
        email: `${userName.toLowerCase().replace(/\s+/g, ".")}@officerassistant.app`,
        rank: userRank,
        vessel,
        department: (userRank.toLowerCase().includes("engineer") || userRank.toLowerCase().includes("engine")) ? "engine" : "deck",
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "active",
      };
      this.users.push(user);
    }

    // 2. Increment user counts
    user.totalRequests += 1;
    if (entry.status === "success") {
      user.successfulRequests += 1;
    } else {
      user.failedRequests += 1;
    }
    user.lastActiveAt = new Date().toISOString();
    user.status = "active";
    if (userRank) user.rank = userRank;
    if (vessel) user.vessel = vessel;

    // 3. Log event
    const logItem: ApiActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRank: user.rank,
      vessel: user.vessel,
      endpoint: entry.endpoint,
      status: entry.status,
      model: entry.model,
      latencyMs: entry.latencyMs,
      productId: entry.productId,
      productName: entry.productName,
      category: entry.category,
      errorMessage: entry.errorMessage,
      authMethod: entry.authMethod,
    };

    this.logs.unshift(logItem);
    this.saveToDisk();

    return logItem;
  }

  public getMetrics(): AdminMetrics {
    // Totals come from reconciled users so KPI cards always match the user table sum.
    const reconciled = this.getReconciledUsers();
    const totalRequests = reconciled.reduce((acc, u) => acc + u.totalRequests, 0);
    const successfulRequests = reconciled.reduce((acc, u) => acc + u.successfulRequests, 0);
    const failedRequests = reconciled.reduce((acc, u) => acc + u.failedRequests, 0);
    const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const activeUsersCount = reconciled.filter((u) => u.lastActiveAt > oneDayAgo).length;

    const categoryBreakdown: Record<string, number> = {
      "spare-deck": 0,
      "spare-engine": 0,
      "galley": 0,
      "stationery": 0,
      "other": 0,
    };

    const rankBreakdown: Record<string, number> = {};

    const endpointBreakdown: Record<string, number> = {};
    const modelBreakdown: Record<string, number> = {};

    let totalLatency = 0;
    let latencyCount = 0;
    let totalIdentified = 0;

    for (const log of this.logs) {
      if (log.latencyMs) {
        totalLatency += log.latencyMs;
        latencyCount += 1;
      }
      if (log.endpoint) {
        endpointBreakdown[log.endpoint] = (endpointBreakdown[log.endpoint] || 0) + 1;
      }
      if (log.model) {
        modelBreakdown[log.model] = (modelBreakdown[log.model] || 0) + 1;
      }
      if (log.status === "success" && log.productId) {
        totalIdentified += 1;
        const cat = log.category || "other";
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      }
      const r = log.userRank || "Officer";
      rankBreakdown[r] = (rankBreakdown[r] || 0) + 1;
    }

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      activeUsersCount,
      totalUsersCount: this.users.length,
      totalProductsIdentified: totalIdentified,
      avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 740,
      categoryBreakdown,
      rankBreakdown,
      endpointBreakdown,
      modelBreakdown,
    };
  }

  public resetData() {
    this.users = INITIAL_USERS.map((u) => ({ ...u }));
    this.logs = INITIAL_LOGS.map((l) => ({ ...l }));
    this.saveToDisk();
  }
}

// Global singleton instance for server session
const globalStore = (globalThis as any).__adminTrackerStore || new AdminTrackerStore();
(globalThis as any).__adminTrackerStore = globalStore;

export const serverAdminTracker = globalStore as AdminTrackerStore;
