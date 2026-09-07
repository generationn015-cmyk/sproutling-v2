import { Link } from "wouter";
import { duePlants, useApp } from "../hooks/useApp";
import { dueLabel } from "../lib/time";
import { Button, Sheet } from "./ui";

export function BellSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { plants, logWater, snooze, photoUrls } = useApp();
  const due = duePlants(plants);

  return (
    <Sheet open={open} title="Due now" onClose={onClose}>
      {due.length === 0 ? (
        <p className="text-sm text-mute">Nothing due. The bell stays quiet until a soil check is actually needed.</p>
      ) : (
        <ul className="space-y-3">
          {due.map((plant) => (
            <li key={plant.id} className="rounded-[22px] bg-parchment p-4">
              <div className="flex gap-3">
                <Thumb src={plant.photoIds[0] ? photoUrls[plant.photoIds[0]] : ""} name={plant.nickname} />
                <div className="min-w-0 flex-1">
                  <Link href={`/plants/${plant.id}`} onClick={onClose} className="serif text-lg text-forest">
                    {plant.nickname}
                  </Link>
                  <p className="text-sm text-mute">{dueLabel(plant.nextWateringAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button className="h-10 px-4" onClick={() => void logWater(plant.id)}>
                      Log water
                    </Button>
                    <Button tone="line" className="h-10 px-4" onClick={() => void snooze(plant.id)}>
                      Snooze 1 day
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

export function Thumb({ src, name }: { src: string; name: string }) {
  return src ? (
    <img src={src} alt={name} className="h-14 w-14 rounded-2xl object-cover" />
  ) : (
    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sage text-forest" aria-hidden>
      ✻
    </div>
  );
}
