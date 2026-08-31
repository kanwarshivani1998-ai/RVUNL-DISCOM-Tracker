import type { Settings } from "@/lib/db/db";
import { isNative, scheduleDailyNative, cancelNative, hasNotificationPermission } from "./notify";
import { buildCountdownMessage } from "./examCountdown";

const DAILY_REMINDER_ID = 1001;

let scheduledTimeout: ReturnType<typeof setTimeout> | null = null;

function msUntilNextTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

/**
 * Reminder ka text — agar exam date set hai to countdown + pace-target,
 * warna generic motivational message.
 * `progress` optional hai (DataContext se aata hai) — na diya to generic message.
 */
function buildReminderBody(settings: Settings, progress?: { completedTopics: number; totalTopics: number }): string {
  if (progress && settings.examDate) {
    const msg = buildCountdownMessage({
      examDate: settings.examDate,
      completedTopics: progress.completedTopics,
      totalTopics: progress.totalTopics,
    });
    if (msg) return msg;
  }
  return "आज का अध्ययन लक्ष्य पूरा करना न भूलें! 📚";
}

export async function scheduleDailyReminder(
  settings: Settings,
  progress?: { completedTopics: number; totalTopics: number }
) {
  if (typeof window === "undefined") return;

  if (scheduledTimeout) {
    clearTimeout(scheduledTimeout);
    scheduledTimeout = null;
  }

  if (!settings.notificationsEnabled) return;

  const body = buildReminderBody(settings, progress);

  // Native Android/iOS: OS-level daily alarm, app band hone par bhi chalega.
  if (isNative()) {
    const granted = await hasNotificationPermission();
    if (!granted) return;
    await scheduleDailyNative(DAILY_REMINDER_ID, "RVUNL/DISCOM Tracker", body, settings.notificationTime);
    return;
  }

  // Web fallback: sirf tab tak chalega jab tak yeh tab/browser khula hai.
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  const delay = msUntilNextTime(settings.notificationTime);

  const fire = () => {
    new Notification("RVUNL/DISCOM Tracker", {
      body: buildReminderBody(settings, progress),
      tag: "rvunl-daily-reminder",
    });
    scheduledTimeout = setTimeout(fire, 24 * 60 * 60 * 1000);
  };

  scheduledTimeout = setTimeout(fire, delay);
}

export async function cancelDailyReminder() {
  if (scheduledTimeout) {
    clearTimeout(scheduledTimeout);
    scheduledTimeout = null;
  }
  if (isNative()) {
    await cancelNative(DAILY_REMINDER_ID);
  }
}
