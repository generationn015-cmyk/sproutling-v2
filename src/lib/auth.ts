const SESSION_KEY = "sproutling.session";

export interface SessionRecord {
  email: string;
  remember: boolean;
  signedInAt: string;
}

export function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export function passwordLooksValid(password: string) {
  return password.length >= 8;
}

export async function digest(text: string) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function newSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt: string) {
  return digest(`${salt}:${password}`);
}

export async function passwordsMatch(password: string, salt: string, hash: string) {
  const next = await hashPassword(password, salt);
  return next === hash;
}

export function readSession(): SessionRecord | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionRecord;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(email: string, remember: boolean) {
  const record: SessionRecord = { email: email.trim().toLowerCase(), remember, signedInAt: new Date().toISOString() };
  const raw = JSON.stringify(record);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  if (remember) localStorage.setItem(SESSION_KEY, raw);
  else sessionStorage.setItem(SESSION_KEY, raw);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function initials(name: string, email?: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "S";
}
