import type { CarePlan, LightLevel, Plant, PlantCondition, VisionResult } from "../types";
import { addDays, daysFromToday, nowIso } from "./time";

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  waterDays: number;
  light: LightLevel;
  lightText: string;
  feed: string;
  humidity: string;
  notes: string;
  petToxicity: string;
  keywords: string[];
}

export const SPECIES: Species[] = [
  {
    id: "pothos",
    commonName: "Pothos",
    scientificName: "Epipremnum aureum",
    family: "aroid",
    waterDays: 8,
    light: "medium",
    lightText: "Medium to bright indirect. Avoid harsh midday sun.",
    feed: "Half-strength houseplant food monthly in spring and summer.",
    humidity: "Average indoor air is fine.",
    notes: "Let the top inch dry. Yellow leaves usually mean too much water.",
    petToxicity: "Toxic to cats and dogs if chewed.",
    keywords: ["pothos", "devil", "ivy", "epipremnum", "golden"],
  },
  {
    id: "monstera",
    commonName: "Monstera",
    scientificName: "Monstera deliciosa",
    family: "aroid",
    waterDays: 9,
    light: "bright",
    lightText: "Bright indirect. A few hours of gentle morning sun is welcome.",
    feed: "Balanced fertilizer every 4 weeks in growing season.",
    humidity: "Prefers a little extra humidity; a nearby humidifier helps.",
    notes: "Water when the top 2 inches are dry. Dust the leaves.",
    petToxicity: "Toxic to pets if ingested.",
    keywords: ["monstera", "deliciosa", "swiss", "cheese"],
  },
  {
    id: "pilea",
    commonName: "Pilea",
    scientificName: "Pilea peperomioides",
    family: "nettle",
    waterDays: 7,
    light: "bright",
    lightText: "Bright indirect. Rotate weekly so it stays round.",
    feed: "Light feed every 3–4 weeks in spring.",
    humidity: "Average home humidity.",
    notes: "Water when the pot feels light. Avoid soggy soil.",
    petToxicity: "Generally considered non-toxic.",
    keywords: ["pilea", "peperomioides", "chinese", "money", "pancake"],
  },
  {
    id: "snake",
    commonName: "Snake plant",
    scientificName: "Dracaena trifasciata",
    family: "succulent-like",
    waterDays: 18,
    light: "low",
    lightText: "Low to bright. Survives a dim corner; grows faster in brighter rooms.",
    feed: "Spare fertilizer — two or three times a year is enough.",
    humidity: "Dry air is fine.",
    notes: "Underwater rather than overwater. Wait until soil is fully dry.",
    petToxicity: "Mildly toxic to pets.",
    keywords: ["snake", "sansevieria", "trifasciata", "mother", "in law"],
  },
  {
    id: "zz",
    commonName: "ZZ plant",
    scientificName: "Zamioculcas zamiifolia",
    family: "aroid",
    waterDays: 16,
    light: "low",
    lightText: "Low to medium. Direct sun can scorch the leaflets.",
    feed: "Light feed two or three times in summer.",
    humidity: "Average indoor air.",
    notes: "Rhizomes store water. Wait until the pot is light.",
    petToxicity: "Toxic if chewed.",
    keywords: ["zz", "zamioculcas", "zamiifolia"],
  },
  {
    id: "peace-lily",
    commonName: "Peace lily",
    scientificName: "Spathiphyllum wallisii",
    family: "aroid",
    waterDays: 6,
    light: "medium",
    lightText: "Medium indirect. Droops when thirsty, then recovers after a drink.",
    feed: "Half-strength monthly in spring and summer.",
    humidity: "Likes humidity. A bathroom with a window is a good home.",
    notes: "Keep evenly moist, not swampy. Brown tips often mean dry air.",
    petToxicity: "Toxic to pets.",
    keywords: ["peace", "lily", "spathiphyllum"],
  },
  {
    id: "fiddle",
    commonName: "Fiddle-leaf fig",
    scientificName: "Ficus lyrata",
    family: "fig",
    waterDays: 8,
    light: "bright",
    lightText: "Bright, steady light. Avoid moving it once it settles.",
    feed: "Fig-friendly fertilizer monthly in growing season.",
    humidity: "Prefers humidity above a typical dry apartment.",
    notes: "Water thoroughly, then wait until the top two inches dry.",
    petToxicity: "Sap is irritating; keep away from pets that chew.",
    keywords: ["fiddle", "fig", "lyrata", "ficus"],
  },
  {
    id: "fern",
    commonName: "Boston fern",
    scientificName: "Nephrolepis exaltata",
    family: "fern",
    waterDays: 4,
    light: "medium",
    lightText: "Medium, filtered light. Direct sun burns fronds.",
    feed: "Very light feed monthly in spring.",
    humidity: "High humidity. Mist or use a pebble tray.",
    notes: "Do not let the root ball dry out completely.",
    petToxicity: "Generally non-toxic.",
    keywords: ["fern", "boston", "nephrolepis", "maidenhair"],
  },
  {
    id: "succulent",
    commonName: "Succulent",
    scientificName: "",
    family: "succulent",
    waterDays: 14,
    light: "direct",
    lightText: "Bright light with some direct sun. Stretching means it wants more light.",
    feed: "Cactus/succulent food two or three times a year.",
    humidity: "Dry air.",
    notes: "Soak, then dry fully. Never leave sitting in a saucer of water.",
    petToxicity: "Varies by species — confirm if pets chew.",
    keywords: ["succulent", "echeveria", "sedum", "jade", "crassula", "aloe", "haworthia"],
  },
  {
    id: "cactus",
    commonName: "Cactus",
    scientificName: "",
    family: "cactus",
    waterDays: 21,
    light: "direct",
    lightText: "Direct sun. A south or west window is ideal.",
    feed: "Cactus food once in spring.",
    humidity: "Dry.",
    notes: "Water deeply and rarely. Almost never in winter.",
    petToxicity: "Spines are the main hazard; some species are toxic.",
    keywords: ["cactus", "cacti", "opuntia", "mammillaria"],
  },
  {
    id: "philodendron",
    commonName: "Philodendron",
    scientificName: "Philodendron hederaceum",
    family: "aroid",
    waterDays: 8,
    light: "medium",
    lightText: "Medium to bright indirect.",
    feed: "Monthly in spring and summer.",
    humidity: "Average to slightly humid.",
    notes: "Water when the top inch is dry.",
    petToxicity: "Toxic to pets.",
    keywords: ["philodendron", "hederaceum", "brasil", "heartleaf"],
  },
  {
    id: "houseplant",
    commonName: "Houseplant",
    scientificName: "",
    family: "general",
    waterDays: 7,
    light: "medium",
    lightText: "Medium indirect light to start. Adjust after a week of watching the leaves.",
    feed: "Half-strength houseplant food monthly in spring and summer.",
    humidity: "Average indoor air.",
    notes: "Check the top inch of soil before watering.",
    petToxicity: "Unknown — look up the species if pets chew leaves.",
    keywords: [],
  },
];

export function findSpecies(query: string): Species | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;
  return SPECIES.find(
    (s) =>
      s.commonName.toLowerCase() === q ||
      s.scientificName.toLowerCase() === q ||
      s.keywords.some((k) => q.includes(k))
  );
}

export function adjustWaterDays(base: number, light: LightLevel, condition: PlantCondition) {
  let days = base;
  if (light === "low") days += 2;
  if (light === "direct") days = Math.max(3, days - 1);
  if (condition === "needs_attention") days = Math.max(3, days - 1);
  if (condition === "thriving") days += 1;
  return Math.max(3, Math.min(28, days));
}

export function planFromSpecies(
  species: Species,
  light: LightLevel,
  condition: PlantCondition = "watching"
): CarePlan {
  const waterDays = adjustWaterDays(species.waterDays, light, condition);
  return {
    light: species.lightText,
    waterDays,
    waterText: `About every ${waterDays} days. Check the top inch first.`,
    feed: species.feed,
    humidity: species.humidity,
    notes: species.notes,
  };
}

export function nextWateringFromNow(waterDays: number) {
  return addDays(nowIso(), waterDays);
}

export type CareStatus = "overdue" | "due" | "upcoming" | "later";

export function careStatus(plant: Plant): CareStatus {
  const n = daysFromToday(plant.nextWateringAt);
  if (n < 0) return "overdue";
  if (n === 0) return "due";
  if (n <= 7) return "upcoming";
  return "later";
}

export function queueForToday(plants: Plant[]) {
  const overdue = plants.filter((p) => careStatus(p) === "overdue").sort(byDue);
  const due = plants.filter((p) => careStatus(p) === "due").sort(byDue);
  const upcoming = plants.filter((p) => careStatus(p) === "upcoming").sort(byDue);
  return { overdue, due, upcoming };
}

function byDue(a: Plant, b: Plant) {
  return new Date(a.nextWateringAt).getTime() - new Date(b.nextWateringAt).getTime();
}

export function visionFromCatalog(query: string): VisionResult {
  const species = findSpecies(query) ?? SPECIES.find((s) => s.id === "houseplant")!;
  const identified = Boolean(findSpecies(query));
  const confidence = identified ? 0.72 : 0.4;
  const plan = planFromSpecies(species, species.light);
  return {
    commonName: species.commonName,
    scientificName: species.scientificName,
    confidence,
    summary: identified
      ? `${species.commonName} matches the name you gave. Confirm the Latin name if you know it.`
      : "No confident species match. Pick a plant from the list or keep a common name.",
    safety: species.petToxicity,
    condition: "watching",
    light: species.light,
    waterDays: plan.waterDays,
    water: plan.waterText,
    feed: plan.feed,
    humidity: plan.humidity,
    nextStep: "Set a nickname and the room it lives in.",
    journeyNote: plan.notes,
    source: identified ? "catalog" : "manual",
  };
}
