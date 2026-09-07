export function nowIso() { return new Date().toISOString(); }
export function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
export function addDays(isoOrDate: string | Date, days: number) { const d = new Date(isoOrDate); d.setDate(d.getDate() + days); return d.toISOString(); }
export function timeOfDay(d = new Date()) { const h = d.getHours(); if (h < 12) return "morning"; if (h < 17) return "afternoon"; return "evening"; }
export function greeting(name: string, d = new Date()) { const first = name.trim().split(/\s+/)[0] || "there"; return `Good ${timeOfDay(d)}, ${first}`; }
export function formatLongDate(d = new Date()) { return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); }
export function formatShortDate(iso: string) { return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
export function formatWeekday(iso: string) { return new Date(iso).toLocaleDateString(undefined, { weekday: "long" }); }
export function daysFromToday(iso: string) { return Math.round((startOfDay(new Date(iso)).getTime() - startOfDay().getTime()) / 86400000); }
export function dueLabel(iso: string) { const n = daysFromToday(iso); if (n < 0) return n === -1 ? "1 day overdue" : `${Math.abs(n)} days overdue`; if (n === 0) return "Due today"; if (n === 1) return "Tomorrow"; return formatWeekday(iso); }
