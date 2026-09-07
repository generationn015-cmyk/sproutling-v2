export type LightLevel = "low" | "medium" | "bright" | "direct";
export type PlantCondition = "thriving" | "watching" | "needs_attention";
export type JournalType = "observe" | "water" | "feed" | "repot" | "photo" | "milestone" | "skip";
export type Units = "metric" | "imperial";

export interface CarePlan {
  light: string;
  waterDays: number;
  waterText: string;
  feed: string;
  humidity: string;
  notes: string;
}

export interface Milestone {
  id: string;
  label: string;
  at: string;
}

export interface Plant {
  id: string;
  nickname: string;
  commonName: string;
  scientificName: string;
  confidence: number;
  photoIds: string[];
  roomId: string;
  lightLevel: LightLevel;
  carePlan: CarePlan;
  petToxicity: string;
  condition: PlantCondition;
  lastWateredAt: string | null;
  nextWateringAt: string;
  lastFedAt: string | null;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  lightDirection: string;
  humidityNote: string;
}

export interface JournalEntry {
  id: string;
  plantId: string | null;
  type: JournalType;
  title: string;
  body: string;
  mood: string;
  photoId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: "me";
  displayName: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  reminderEnabled: boolean;
  reminderHour: number;
  reducedMotion: boolean;
  units: Units;
  notificationPermission: NotificationPermission | "unsupported";
  onboarded: boolean;
  createdAt: string;
}

export interface PairingCode {
  id: "active";
  code: string;
  expiresAt: string;
}

export interface PhotoRecord {
  id: string;
  mime: string;
  blob: Blob;
  createdAt: string;
}

export interface VisionResult {
  commonName: string;
  scientificName: string;
  confidence: number;
  summary: string;
  safety: string;
  condition: PlantCondition;
  light: LightLevel;
  waterDays: number;
  water: string;
  feed: string;
  humidity: string;
  nextStep: string;
  journeyNote: string;
  source: "api" | "catalog" | "manual";
}

export interface ToastMessage {
  id: string;
  text: string;
}
