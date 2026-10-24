import { db, getActiveContractId } from "@/lib/db";
import { getGibsStatus, getSignOffStatus, formatDate } from "@/lib/gibs";
import { NEWS } from "@/lib/news";

export interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  detail: string;
  href: string;
  hot: boolean;
  category: "news" | "note" | "gibs" | "signoff" | "weather";
}

export const SEEN_NEWS_KEY = "oa-news-seen";
export const DISMISSED_NOTIFS_KEY = "oa-notif-dismissed";
export const NOTIFICATIONS_UPDATED_EVENT = "oa-notifications-updated";

/**
 * Retrieve dismissed notification keys from localStorage.
 */
export function getDismissedNotifications(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist dismissed notification keys to localStorage.
 */
export function setDismissedNotifications(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISMISSED_NOTIFS_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch { /* ignore */ }
}

/**
 * Retrieve seen news IDs from localStorage.
 */
export function getSeenNews(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEEN_NEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist seen news IDs to localStorage.
 */
export function setSeenNews(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEEN_NEWS_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch { /* ignore */ }
}

/**
 * Notify all instances and windows that notification status has changed.
 */
export function notifyNotificationsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  try {
    window.dispatchEvent(new Event("storage"));
  } catch { /* ignore */ }
}

/**
 * Fetch all unread notification items across contracts, notes, weather, and announcements.
 * Fixes desynchronization and queue refills by bounding announcement candidates to the latest
 * posts rather than endlessly pulling older archive articles when previous ones are read.
 */
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const out: NotificationItem[] = [];
  const dismissed = getDismissedNotifications();
  const seenNews = getSeenNews();

  try {
    // 1. Active contract GIBS alert
    const contracts = await db.contracts.toArray();
    const activeId = getActiveContractId();
    const active = contracts.find((c) => c.id === activeId) ?? null;
    if (active) {
      const gibsId = `gibs-${active.id}`;
      if (!dismissed.includes(gibsId) && !dismissed.includes("gibs")) {
        const g = getGibsStatus(active);
        if (!g.done && (g.urgent || g.overdue) && g.deadline) {
          out.push({
            id: gibsId,
            icon: "📋",
            title: `GIBS: ${g.overdue ? "OVERDUE" : `${g.daysLeft} days left`}`,
            detail: `Sign-on docs • deadline ${formatDate(g.deadline)}`,
            href: "/dashboard",
            hot: true,
            category: "gibs",
          });
        }
      }
    }

    // 2. Archived contract sign-off pending docs
    const ended = contracts.find((c) => c.status === "archived" && c.signOffDate && !c.gibsOffDone);
    if (ended) {
      const signoffId = `signoff-${ended.id}`;
      if (!dismissed.includes(signoffId) && !dismissed.includes("signoff")) {
        const s = getSignOffStatus(ended);
        out.push({
          id: signoffId,
          icon: "🛳️",
          title: "Sign-off docs pending",
          detail: `${ended.shipName} • signed off ${ended.signOffDate}${s.deadline ? ` • deadline ${formatDate(s.deadline)}` : ""}`,
          href: "/dashboard",
          hot: Boolean(s.urgent || s.overdue),
          category: "signoff",
        });
      }
    }

    // 3. Due note reminders from IndexedDB
    const now = new Date().toISOString();
    const dueNotes = await db.notes.where("remindAt").belowOrEqual(now).toArray();
    for (const n of dueNotes.filter((x) => !x.reminded && x.remindAt).slice(0, 5)) {
      const noteNotifId = `note-${n.id}`;
      if (!dismissed.includes(noteNotifId)) {
        out.push({
          id: noteNotifId,
          icon: "🔔",
          title: n.title,
          detail: (n.body || "Voice note").slice(0, 80),
          href: "/notes",
          hot: true,
          category: "note",
        });
      }
    }

    // 4. Cached weather warnings
    if (typeof window !== "undefined") {
      try {
        const wxRaw = localStorage.getItem("oa-wx-cache");
        if (wxRaw) {
          const wx = JSON.parse(wxRaw);
          const windId = `wx-wind-${wx.place ?? "pos"}`;
          const rainId = `wx-rain-${wx.place ?? "pos"}`;

          if (wx.wind >= 25 && !dismissed.includes(windId) && !dismissed.includes("wx-wind")) {
            out.push({
              id: windId,
              icon: "💨",
              title: `Strong wind ${Math.round(wx.wind)} kn`,
              detail: wx.place ?? "on position",
              href: "/dashboard",
              hot: true,
              category: "weather",
            });
          } else if ((wx.precip ?? 0) > 5 && !dismissed.includes(rainId) && !dismissed.includes("wx-rain")) {
            out.push({
              id: rainId,
              icon: "🌧️",
              title: `Heavy rain ${wx.precip} mm`,
              detail: wx.place ?? "on position",
              href: "/dashboard",
              hot: false,
              category: "weather",
            });
          }
        }
      } catch { /* ignore */ }
    }

    // 5. News Announcements:
    // Bound candidate pool to the latest announcements (top 3 newest articles in NEWS).
    // Avoids the queue refill bug where reading 3 notifications would perpetually pull
    // older archive posts to keep the counter stuck at 3.
    const latestAnnouncements = NEWS.slice(0, 3);
    for (const p of latestAnnouncements) {
      const newsNotifId = `news-${p.id}`;
      if (!seenNews.includes(p.id) && !dismissed.includes(newsNotifId)) {
        out.push({
          id: newsNotifId,
          icon: "📰",
          title: p.title,
          detail: `${p.tag} • ${p.date}`,
          href: `/news/${p.id}`,
          hot: false,
          category: "news",
        });
      }
    }
  } catch { /* ignore */ }

  return out;
}

/**
 * Mark a single notification item as read / dismissed and synchronize state.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const dismissed = getDismissedNotifications();
  dismissed.push(id);

  if (id.startsWith("news-")) {
    const newsId = id.slice(5);
    const seen = getSeenNews();
    if (!seen.includes(newsId)) {
      seen.push(newsId);
      setSeenNews(seen);
    }
  } else if (id.startsWith("note-")) {
    const noteId = id.slice(5);
    try {
      await db.notes.update(noteId, { reminded: true });
    } catch { /* ignore */ }
  } else if (id.startsWith("gibs")) {
    dismissed.push("gibs");
  } else if (id.startsWith("signoff")) {
    dismissed.push("signoff");
  } else if (id.startsWith("wx-wind")) {
    dismissed.push("wx-wind");
  } else if (id.startsWith("wx-rain")) {
    dismissed.push("wx-rain");
  }

  setDismissedNotifications(dismissed);
  notifyNotificationsUpdated();
}

/**
 * Mark all notifications as read: marks all news seen, updates due notes in Dexie,
 * and dismisses all active alerts.
 */
export async function markAllNotificationsAsRead(currentItems?: NotificationItem[]): Promise<void> {
  // 1. Mark all news as seen
  const allNewsIds = NEWS.map((n) => n.id);
  setSeenNews(allNewsIds);

  // 2. Mark notes in Dexie as reminded
  try {
    const now = new Date().toISOString();
    const dueNotes = await db.notes.where("remindAt").belowOrEqual(now).toArray();
    for (const n of dueNotes) {
      if (!n.reminded) {
        await db.notes.update(n.id, { reminded: true });
      }
    }
  } catch { /* ignore */ }

  // 3. Mark all current items as dismissed
  const dismissed = getDismissedNotifications();
  if (currentItems) {
    for (const item of currentItems) {
      dismissed.push(item.id);
    }
  }
  dismissed.push("gibs", "signoff", "wx-wind", "wx-rain");
  setDismissedNotifications(dismissed);

  // 4. Synchronize across tabs and components
  notifyNotificationsUpdated();
}

/**
 * Mark all news items as seen when visiting the news page.
 */
export function markAllNewsAsSeen(): void {
  const allNewsIds = NEWS.map((n) => n.id);
  setSeenNews(allNewsIds);
  notifyNotificationsUpdated();
}

/**
 * Mark an individual news post as seen.
 */
export function markNewsPostAsSeen(postId: string): void {
  const seen = getSeenNews();
  if (!seen.includes(postId)) {
    seen.push(postId);
    setSeenNews(seen);
    notifyNotificationsUpdated();
  }
}
