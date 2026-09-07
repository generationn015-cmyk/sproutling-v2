import Dexie, { type Table } from "dexie";
import type { JournalEntry, PairingCode, PhotoRecord, Plant, Room, UserProfile } from "../types";

class SproutlingDB extends Dexie {
  plants!: Table<Plant, string>;
  rooms!: Table<Room, string>;
  entries!: Table<JournalEntry, string>;
  photos!: Table<PhotoRecord, string>;
  user!: Table<UserProfile, string>;
  pairing!: Table<PairingCode, string>;
  constructor() {
    super("sproutling-v2");
    this.version(1).stores({
      plants: "id, roomId, nextWateringAt, nickname, commonName",
      rooms: "id, name",
      entries: "id, plantId, createdAt, type",
      photos: "id, createdAt",
      user: "id",
      pairing: "id",
    });
  }
}
export const db = new SproutlingDB();
export const DEFAULT_ROOMS: Room[] = [
  { id: "living", name: "Living room", lightDirection: "east / south", humidityNote: "Average" },
  { id: "kitchen", name: "Kitchen", lightDirection: "varies", humidityNote: "A little extra from cooking" },
  { id: "bedroom", name: "Bedroom", lightDirection: "often softer", humidityNote: "Average" },
  { id: "bathroom", name: "Bathroom", lightDirection: "usually low", humidityNote: "Higher after showers" },
  { id: "office", name: "Office", lightDirection: "desk / window", humidityNote: "Dry if HVAC runs" },
];
export const DEFAULT_USER: UserProfile = {
  id: "me", displayName: "", reminderEnabled: false, reminderHour: 9, reducedMotion: false,
  units: "imperial", notificationPermission: typeof Notification === "undefined" ? "unsupported" : Notification.permission,
};
export async function ensureDefaults() {
  if ((await db.rooms.count()) === 0) await db.rooms.bulkAdd(DEFAULT_ROOMS);
  if (!(await db.user.get("me"))) await db.user.put(DEFAULT_USER);
}
export function uid(prefix = "id") { return `${prefix}_${crypto.randomUUID()}`; }
export async function savePhoto(blob: Blob) {
  const id = uid("photo");
  await db.photos.put({ id, mime: blob.type || "image/jpeg", blob, createdAt: new Date().toISOString() });
  return id;
}
export async function exportBundle() {
  const [plants, rooms, entries, photos, user] = await Promise.all([
    db.plants.toArray(), db.rooms.toArray(), db.entries.toArray(), db.photos.toArray(), db.user.get("me"),
  ]);
  return { version: 2, exportedAt: new Date().toISOString(), user, rooms, plants, entries, photos: photos.map((p) => ({ id: p.id, mime: p.mime, createdAt: p.createdAt })) };
}
export async function wipeAll() {
  await Promise.all([db.plants.clear(), db.entries.clear(), db.photos.clear(), db.pairing.clear()]);
  await db.user.put(DEFAULT_USER);
  await db.rooms.bulkPut(DEFAULT_ROOMS);
}
export function mintPairingCode(): PairingCode {
  return { id: "active", code: String(Math.floor(100000 + Math.random() * 900000)), expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() };
}
