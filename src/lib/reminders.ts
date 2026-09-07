import type { Plant, UserProfile } from "../types";
import { queueForToday } from "./care";
export function permissionState(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}
export async function requestReminders(): Promise<NotificationPermission | "unsupported"> {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.requestPermission();
}
export async function notifyDue(user: UserProfile, plants: Plant[]) {
  const q = queueForToday(plants);
  const n = q.overdue.length + q.due.length;
  if (!user.reminderEnabled || n === 0 || typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const title = n === 1 ? "One plant needs a soil check" : `${n} plants need a soil check`;
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) { await reg.showNotification(title, { body: "Open Sproutling to log water, skip, or snooze.", icon: "/favicon.svg", tag: "sproutling-due" }); return; }
  } catch {}
  new Notification(title, { body: "Open Sproutling to log water, skip, or snooze." });
}
export function maybeDailyNudge(user: UserProfile, plants: Plant[]) {
  if (!user.reminderEnabled) return;
  if (new Date().getHours() < user.reminderHour) return;
  const today = new Date().toDateString();
  if (localStorage.getItem("sproutling-last-nudge") === today) return;
  localStorage.setItem("sproutling-last-nudge", today);
  void notifyDue(user, plants);
}
