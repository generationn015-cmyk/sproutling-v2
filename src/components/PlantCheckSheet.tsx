import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "../hooks/useApp";
import { Button, Sheet } from "./ui";

export function PlantCheckSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { plants, logWater, photoUrls } = useApp();
  const [, setLoc] = useLocation();
  const [picked, setPicked] = useState("");

  return (
    <Sheet open={open} title="Plant check" onClose={onClose}>
      {plants.length === 0 ? (
        <div>
          <p className="text-sm text-mute">Add a plant first, then you can log water from here.</p>
          <Button className="mt-4" onClick={() => { onClose(); setLoc("/plants/new"); }}>
            Identify from a photo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-mute">Pick a plant, log water, or open its profile.</p>
          <div className="flex flex-wrap gap-2">
            {plants.map((p) => (
              <button
                key={p.id}
                onClick={() => setPicked(p.id)}
                className={`rounded-full border px-3 py-2 text-sm ${picked === p.id ? "border-forest bg-sage" : "border-forest/15"}`}
              >
                {p.nickname}
              </button>
            ))}
          </div>
          {picked ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void logWater(picked)}>Log water</Button>
              <Button
                tone="line"
                onClick={() => {
                  onClose();
                  setLoc(`/plants/${picked}`);
                }}
              >
                Open profile
              </Button>
            </div>
          ) : null}
          <div className="flex gap-2 overflow-x-auto pt-2">
            {plants.slice(0, 8).map((p) => (
              <button key={p.id} onClick={() => setPicked(p.id)} className="shrink-0">
                {p.photoIds[0] && photoUrls[p.photoIds[0]] ? (
                  <img src={photoUrls[p.photoIds[0]]} alt={p.nickname} className="h-16 w-16 rounded-2xl object-cover" />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sage">{p.nickname[0]}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}
