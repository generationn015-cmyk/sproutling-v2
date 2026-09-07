import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button, Field, Label } from "../components/ui";
import { useApp } from "../hooks/useApp";
import { SPECIES, findSpecies, planFromSpecies } from "../lib/care";
import { compressImage } from "../lib/compress";
import { nextWateringFromNow } from "../lib/care";
import { analyzePlant } from "../lib/vision";
import type { LightLevel, PlantCondition, VisionResult } from "../types";

export function PlantNewPage() {
  const search = useSearch();
  const manualStart = new URLSearchParams(search).get("manual") === "1";
  const { rooms, addPhoto, addPlant, toast } = useApp();
  const [, setLoc] = useLocation();

  const [step, setStep] = useState<1 | 2>(1);
  const [preview, setPreview] = useState("");
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [vision, setVision] = useState<VisionResult | null>(manualStart ? null : null);
  const [nickname, setNickname] = useState("");
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "living");
  const [light, setLight] = useState<LightLevel>("medium");
  const [condition, setCondition] = useState<PlantCondition>("watching");

  const lowConfidence = confidence > 0 && confidence < 0.55;

  async function onFile(file: File) {
    setBusy(true);
    try {
      const blob = await compressImage(file);
      const id = await addPhoto(blob);
      setPhotoId(id);
      setPreview(URL.createObjectURL(blob));
      const dataUrl = await blobToDataUrl(blob);
      const result = await analyzePlant({ imageDataUrl: dataUrl, hint });
      applyVision(result);
      if (result.source !== "api") {
        toast("Vision API is offline — using the species catalog");
      }
    } catch {
      toast("Could not read that photo");
    } finally {
      setBusy(false);
    }
  }

  function applyVision(result: VisionResult) {
    setVision(result);
    setCommonName(result.commonName);
    setScientificName(result.scientificName);
    setConfidence(result.confidence);
    setLight(result.light);
    setCondition(result.condition);
    if (!nickname) setNickname(result.commonName);
  }

  function applyHint() {
    const result = findSpecies(hint);
    if (result) {
      applyVision({
        commonName: result.commonName,
        scientificName: result.scientificName,
        confidence: 0.7,
        summary: "Matched from the name you typed.",
        safety: result.petToxicity,
        condition: "watching",
        light: result.light,
        waterDays: result.waterDays,
        water: result.notes,
        feed: result.feed,
        humidity: result.humidity,
        nextStep: "Name it and pick a room.",
        journeyNote: result.notes,
        source: "catalog",
      });
    } else {
      applyVision({
        commonName: hint || "Houseplant",
        scientificName: "",
        confidence: 0.4,
        summary: "No confident species match. You can still save it.",
        safety: "Unknown — look up the species if pets chew leaves.",
        condition: "watching",
        light: "medium",
        waterDays: 7,
        water: "About every 7 days. Check the top inch first.",
        feed: "Half-strength houseplant food monthly in spring and summer.",
        humidity: "Average indoor air.",
        nextStep: "Name it and pick a room.",
        journeyNote: "Watch the leaves for a week, then tighten the interval.",
        source: "manual",
      });
    }
  }

  const species = useMemo(() => findSpecies(commonName) ?? SPECIES.find((s) => s.id === "houseplant")!, [commonName]);

  async function save() {
    const name = nickname.trim() || commonName || "Unnamed plant";
    const plan = planFromSpecies(species, light, condition);
    const plant = await addPlant({
      nickname: name,
      commonName: commonName || species.commonName,
      scientificName: confidence >= 0.55 ? scientificName : scientificName,
      confidence,
      photoIds: photoId ? [photoId] : [],
      roomId,
      lightLevel: light,
      carePlan: plan,
      petToxicity: species.petToxicity,
      condition,
      lastWateredAt: null,
      nextWateringAt: nextWateringFromNow(plan.waterDays),
      lastFedAt: null,
      milestones: [],
    });
    setLoc(`/plants/${plant.id}`);
  }

  return (
    <div className="max-w-xl">
      <p className="label">Add plant</p>
      <h1 className="serif mt-1 text-4xl text-forest">{step === 1 ? "Photo first" : "Name and home"}</h1>
      <p className="mt-2 text-sm text-mute">
        {step === 1
          ? "Use any camera. If identification is unsure, you will be asked to confirm."
          : "A nickname, a room, and the light it actually gets."}
      </p>

      {step === 1 ? (
        <div className="mt-8 space-y-5">
          <label className="block cursor-pointer rounded-[28px] border border-dashed border-forest/25 bg-parchment p-8 text-center">
            {preview ? (
              <img src={preview} alt="Selected plant" className="mx-auto max-h-72 rounded-[22px] object-contain" />
            ) : (
              <>
                <p className="serif text-2xl text-forest">Drop a photo or tap to choose</p>
                <p className="mt-2 text-sm text-mute">Compressed to 1280px JPEG before it is stored.</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFile(file);
              }}
            />
          </label>
          <div>
            <Label>Species hint (optional)</Label>
            <Field placeholder="Pilea, pothos, fern…" value={hint} onChange={(e) => setHint(e.target.value)} />
          </div>
          {vision ? (
            <div className="rounded-[22px] bg-sage/60 p-4 text-sm">
              <p className="font-medium text-forest">
                We are {Math.round(vision.confidence * 100)}% sure this is {vision.commonName}
                {vision.scientificName ? ` (${vision.scientificName})` : ""}.
              </p>
              <p className="mt-2 text-mute">{vision.summary}</p>
              {lowConfidence ? <p className="mt-2">Confidence is low. Confirm the name or try another angle.</p> : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy}
              onClick={() => {
                if (hint && !vision) applyHint();
                setStep(2);
              }}
            >
              {busy ? "Reading photo…" : preview || vision ? "Continue" : "Use this name"}
            </Button>
            <Button tone="line" onClick={() => { applyHint(); setStep(2); }}>
              Add manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {preview ? <img src={preview} alt="" className="h-40 w-full rounded-[22px] object-cover" /> : null}
          {lowConfidence ? (
            <p className="rounded-[18px] bg-gold/40 px-4 py-3 text-sm">
              Confidence is under 55%. Leave the Latin name blank unless you are sure.
            </p>
          ) : null}
          <div>
            <Label>Nickname</Label>
            <Field value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="The plant by the window" />
          </div>
          <div>
            <Label>Common name</Label>
            <Field value={commonName} onChange={(e) => setCommonName(e.target.value)} list="species" />
            <datalist id="species">
              {SPECIES.map((s) => (
                <option key={s.id} value={s.commonName} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Scientific name</Label>
            <Field
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder={lowConfidence ? "Leave blank if unsure" : ""}
            />
          </div>
          <div>
            <Label>Room</Label>
            <select className="tap w-full rounded-full border border-forest/15 bg-parchment-2 px-4 text-sm" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Light in that spot</Label>
            <div className="flex flex-wrap gap-2">
              {(["low", "medium", "bright", "direct"] as LightLevel[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLight(l)}
                  className={`rounded-full px-4 py-2 text-sm ${light === l ? "bg-forest text-parchment-2" : "bg-parchment"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button tone="line" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => void save()}>Save plant</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
