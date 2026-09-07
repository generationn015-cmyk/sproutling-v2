import type { VisionResult } from "../types";
import { visionFromCatalog } from "./care";
export async function analyzePlant(input: { imageDataUrl?: string; hint?: string; }): Promise<VisionResult> {
  try {
    const res = await fetch("/api/plant-vision/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: input.imageDataUrl, hint: input.hint }),
    });
    if (res.ok) {
      const data = (await res.json()) as VisionResult;
      if (data.commonName) return { ...data, source: "api", confidence: Math.max(0, Math.min(1, data.confidence)) };
    }
  } catch {}
  return visionFromCatalog(input.hint ?? "");
}
