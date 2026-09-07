import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { JournalEntry, JournalType, PairingCode, Plant, Room, ToastMessage, UserProfile } from "../types";
import { careStatus } from "../lib/care";
import {
  clearSession,
  emailLooksValid,
  hashPassword,
  newSalt,
  passwordLooksValid,
  passwordsMatch,
  readSession,
  writeSession,
} from "../lib/auth";
import { maybeDailyNudge, permissionState, requestReminders } from "../lib/reminders";
import { DEFAULT_USER, db, ensureDefaults, exportBundle, mintPairingCode, normalizeUser, savePhoto, uid, wipeAll } from "../lib/storage";
import { addDays, nowIso } from "../lib/time";

interface AppState {
  ready: boolean;
  signedIn: boolean;
  hasAccount: boolean;
  plants: Plant[];
  rooms: Room[];
  entries: JournalEntry[];
  user: UserProfile;
  pairing: PairingCode | null;
  toasts: ToastMessage[];
  photoUrls: Record<string, string>;
}

interface AppContextValue extends AppState {
  plantById: (id: string) => Plant | undefined;
  roomName: (id: string) => string;
  toast: (text: string) => void;
  saveUser: (patch: Partial<UserProfile>) => Promise<void>;
  addPlant: (plant: Omit<Plant, "id" | "createdAt" | "updatedAt">) => Promise<Plant>;
  updatePlant: (id: string, patch: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  addPhoto: (blob: Blob) => Promise<string>;
  addEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<void>;
  logWater: (plantId: string) => Promise<void>;
  snooze: (plantId: string, days?: number) => Promise<void>;
  skipWater: (plantId: string) => Promise<void>;
  logFeed: (plantId: string) => Promise<void>;
  addMilestone: (plantId: string, label: string) => Promise<void>;
  enableReminders: () => Promise<void>;
  disableReminders: () => Promise<void>;
  createPairing: () => Promise<PairingCode>;
  exportData: () => Promise<void>;
  deleteAll: () => Promise<void>;
  signUp: (input: { displayName: string; email: string; password: string; remember: boolean }) => Promise<void>;
  signIn: (input: { email: string; password: string; remember: boolean }) => Promise<void>;
  signOut: () => void;
  completeOnboarding: (patch?: Partial<UserProfile>) => Promise<void>;
}

const AppCtx = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}

export { AppCtx };

export function useAppSource(): AppContextValue {
  const [ready, setReady] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [user, setUser] = useState<UserProfile>({ ...DEFAULT_USER, notificationPermission: permissionState() });
  const [signedIn, setSignedIn] = useState(false);
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    await ensureDefaults();
    const [p, r, e, u, pair] = await Promise.all([
      db.plants.toArray(),
      db.rooms.toArray(),
      db.entries.orderBy("createdAt").reverse().toArray(),
      db.user.get("me"),
      db.pairing.get("active"),
    ]);
    setPlants(p);
    setRooms(r);
    setEntries(e);
    const profile = normalizeUser(u);
    setUser({ ...profile, notificationPermission: permissionState() });
    const session = readSession();
    const accountReady = Boolean(profile.email && profile.passwordHash);
    setSignedIn(Boolean(session && accountReady && session.email === profile.email));
    if (pair && new Date(pair.expiresAt).getTime() > Date.now()) setPairing(pair);
    else setPairing(null);

    const ids = new Set<string>();
    p.forEach((plant) => plant.photoIds.forEach((id) => ids.add(id)));
    e.forEach((entry) => entry.photoId && ids.add(entry.photoId));
    const next: Record<string, string> = {};
    await Promise.all(
      [...ids].map(async (id) => {
        const rec = await db.photos.get(id);
        if (rec) next[id] = URL.createObjectURL(rec.blob);
      })
    );
    setPhotoUrls((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
      return next;
    });
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const root = document.documentElement;
    const prefer = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.toggle("quiet-motion", user.reducedMotion || prefer);
  }, [user.reducedMotion]);

  useEffect(() => {
    if (!ready) return;
    maybeDailyNudge(user, plants);
  }, [ready, user, plants]);

  const toast = useCallback((text: string) => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const plantById = useCallback((id: string) => plants.find((p) => p.id === id), [plants]);
  const roomName = useCallback((id: string) => rooms.find((r) => r.id === id)?.name ?? "Unassigned", [rooms]);

  const saveUser = useCallback(async (patch: Partial<UserProfile>) => {
    const current = normalizeUser(await db.user.get("me"));
    const next = { ...current, ...patch };
    await db.user.put(next);
    setUser({ ...next, notificationPermission: permissionState() });
  }, []);

  const signUp = useCallback(
    async ({ displayName, email, password, remember }: { displayName: string; email: string; password: string; remember: boolean }) => {
      const name = displayName.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (name.length < 2) throw new Error("Add the name you want in the greeting.");
      if (!emailLooksValid(cleanEmail)) throw new Error("That email does not look right.");
      if (!passwordLooksValid(password)) throw new Error("Use at least 8 characters for your password.");
      const existing = normalizeUser(await db.user.get("me"));
      if (existing.email && existing.passwordHash) throw new Error("This device already has an account. Sign in instead.");
      const salt = newSalt();
      const passwordHash = await hashPassword(password, salt);
      const next: UserProfile = {
        ...existing,
        displayName: name,
        email: cleanEmail,
        passwordSalt: salt,
        passwordHash,
        onboarded: false,
        createdAt: nowIso(),
        notificationPermission: permissionState(),
      };
      await db.user.put(next);
      writeSession(cleanEmail, remember);
      setUser(next);
      setSignedIn(true);
      toast("Welcome to Sproutling");
    },
    [toast]
  );

  const signIn = useCallback(
    async ({ email, password, remember }: { email: string; password: string; remember: boolean }) => {
      const cleanEmail = email.trim().toLowerCase();
      const existing = normalizeUser(await db.user.get("me"));
      if (!existing.email || !existing.passwordHash) throw new Error("No account on this device yet. Create one first.");
      if (existing.email !== cleanEmail) throw new Error("No account with that email on this device.");
      const ok = await passwordsMatch(password, existing.passwordSalt, existing.passwordHash);
      if (!ok) throw new Error("Password does not match.");
      writeSession(cleanEmail, remember);
      setUser({ ...existing, notificationPermission: permissionState() });
      setSignedIn(true);
      toast("Signed in");
    },
    [toast]
  );

  const signOut = useCallback(() => {
    clearSession();
    setSignedIn(false);
    toast("Signed out");
  }, [toast]);

  const completeOnboarding = useCallback(
    async (patch?: Partial<UserProfile>) => {
      await saveUser({ ...patch, onboarded: true });
      toast("Your space is ready");
    },
    [saveUser, toast]
  );

  const addPlant = useCallback(async (input: Omit<Plant, "id" | "createdAt" | "updatedAt">) => {
    const plant: Plant = { ...input, id: uid("plant"), createdAt: nowIso(), updatedAt: nowIso() };
    await db.plants.put(plant);
    setPlants((list) => [plant, ...list]);
    toast(`${plant.nickname} is in your collection`);
    return plant;
  }, [toast]);

  const updatePlant = useCallback(async (id: string, patch: Partial<Plant>) => {
    const current = await db.plants.get(id);
    if (!current) return;
    const next = { ...current, ...patch, updatedAt: nowIso() };
    await db.plants.put(next);
    setPlants((list) => list.map((p) => (p.id === id ? next : p)));
  }, []);

  const deletePlant = useCallback(async (id: string) => {
    await db.plants.delete(id);
    const related = await db.entries.where("plantId").equals(id).toArray();
    await db.entries.bulkDelete(related.map((e) => e.id));
    setPlants((list) => list.filter((p) => p.id !== id));
    setEntries((list) => list.filter((e) => e.plantId !== id));
    toast("Plant removed");
  }, [toast]);

  const addPhoto = useCallback(async (blob: Blob) => {
    const id = await savePhoto(blob);
    const url = URL.createObjectURL(blob);
    setPhotoUrls((prev) => ({ ...prev, [id]: url }));
    return id;
  }, []);

  const addEntry = useCallback(async (input: Omit<JournalEntry, "id" | "createdAt">) => {
    const entry: JournalEntry = { ...input, id: uid("entry"), createdAt: nowIso() };
    await db.entries.put(entry);
    setEntries((list) => [entry, ...list]);
    return entry;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await db.entries.delete(id);
    setEntries((list) => list.filter((e) => e.id !== id));
    toast("Entry deleted");
  }, [toast]);

  const writeCare = useCallback(
    async (plantId: string, type: JournalType, title: string, nextWateringAt?: string, extra?: Partial<Plant>) => {
      const plant = await db.plants.get(plantId);
      if (!plant) return;
      const patch: Partial<Plant> = { ...extra };
      if (nextWateringAt) patch.nextWateringAt = nextWateringAt;
      if (type === "water") patch.lastWateredAt = nowIso();
      if (type === "feed") patch.lastFedAt = nowIso();
      await updatePlant(plantId, patch);
      await addEntry({ plantId, type, title, body: "", mood: "" });
    },
    [addEntry, updatePlant]
  );

  const logWater = useCallback(
    async (plantId: string) => {
      const plant = await db.plants.get(plantId);
      if (!plant) return;
      await writeCare(plantId, "water", `Watered ${plant.nickname}`, addDays(nowIso(), plant.carePlan.waterDays));
      toast(`Water logged for ${plant.nickname}`);
    },
    [toast, writeCare]
  );

  const snooze = useCallback(
    async (plantId: string, days = 1) => {
      const plant = await db.plants.get(plantId);
      if (!plant) return;
      await writeCare(plantId, "skip", `Snoozed ${plant.nickname} ${days} day`, addDays(plant.nextWateringAt, days));
      toast("Snoozed 1 day");
    },
    [toast, writeCare]
  );

  const skipWater = useCallback(
    async (plantId: string) => {
      const plant = await db.plants.get(plantId);
      if (!plant) return;
      await writeCare(plantId, "skip", `Skipped watering ${plant.nickname}`, addDays(nowIso(), plant.carePlan.waterDays));
      toast("Skipped — next check moved");
    },
    [toast, writeCare]
  );

  const logFeed = useCallback(
    async (plantId: string) => {
      const plant = await db.plants.get(plantId);
      if (!plant) return;
      await writeCare(plantId, "feed", `Fed ${plant.nickname}`);
      toast("Feed logged");
    },
    [toast, writeCare]
  );

  const addMilestone = useCallback(
    async (plantId: string, label: string) => {
      const plant = await db.plants.get(plantId);
      if (!plant) return;
      const milestone = { id: uid("ms"), label, at: nowIso() };
      await updatePlant(plantId, { milestones: [milestone, ...plant.milestones] });
      await addEntry({ plantId, type: "milestone", title: label, body: "", mood: "new-leaf" });
      toast("Milestone saved");
    },
    [addEntry, toast, updatePlant]
  );

  const enableReminders = useCallback(async () => {
    const perm = await requestReminders();
    if (perm === "unsupported") {
      await saveUser({ reminderEnabled: false, notificationPermission: "unsupported" });
      toast("This browser cannot send notifications");
      return;
    }
    if (perm !== "granted") {
      await saveUser({ reminderEnabled: false, notificationPermission: perm });
      toast("Notifications blocked — turn them on in browser settings");
      return;
    }
    await saveUser({ reminderEnabled: true, notificationPermission: perm });
    toast("Gentle reminders on");
  }, [saveUser, toast]);

  const disableReminders = useCallback(async () => {
    await saveUser({ reminderEnabled: false });
    toast("Reminders off");
  }, [saveUser, toast]);

  const createPairing = useCallback(async () => {
    const code = mintPairingCode();
    await db.pairing.put(code);
    setPairing(code);
    toast("Pairing code expires in 15 minutes");
    return code;
  }, [toast]);

  const exportData = useCallback(async () => {
    const bundle = await exportBundle();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sproutling-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Export downloaded");
  }, [toast]);

  const deleteAll = useCallback(async () => {
    await wipeAll();
    await reload();
    toast("All local data deleted");
  }, [reload, toast]);

  return useMemo(
    () => ({
      ready,
      signedIn,
      hasAccount: Boolean(user.email && user.passwordHash),
      plants,
      rooms,
      entries,
      user,
      pairing,
      toasts,
      photoUrls,
      plantById,
      roomName,
      toast,
      saveUser,
      addPlant,
      updatePlant,
      deletePlant,
      addPhoto,
      addEntry,
      deleteEntry,
      logWater,
      snooze,
      skipWater,
      logFeed,
      addMilestone,
      enableReminders,
      disableReminders,
      createPairing,
      exportData,
      deleteAll,
      signUp,
      signIn,
      signOut,
      completeOnboarding,
    }),
    [
      ready,
      signedIn,
      user.email,
      user.passwordHash,
      plants,
      rooms,
      entries,
      user,
      pairing,
      toasts,
      photoUrls,
      plantById,
      roomName,
      toast,
      saveUser,
      addPlant,
      updatePlant,
      deletePlant,
      addPhoto,
      addEntry,
      deleteEntry,
      logWater,
      snooze,
      skipWater,
      logFeed,
      addMilestone,
      enableReminders,
      disableReminders,
      createPairing,
      exportData,
      deleteAll,
      signUp,
      signIn,
      signOut,
      completeOnboarding,
    ]
  );
}

export function duePlants(plants: Plant[]) {
  return plants.filter((p) => {
    const s = careStatus(p);
    return s === "due" || s === "overdue";
  });
}
