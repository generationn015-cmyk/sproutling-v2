import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "../components/ui";
import { useApp } from "../hooks/useApp";
import { dueLabel, formatShortDate } from "../lib/time";

export function PlantProfilePage() {
  const params = useParams<{ id: string }>();
  const { plantById, photoUrls, roomName, entries, logWater, snooze, skipWater, logFeed, addMilestone, deletePlant } =
    useApp();
  const [, setLoc] = useLocation();
  const plant = plantById(params.id ?? "");
  const [confirm, setConfirm] = useState(false);

  const journal = useMemo(
    () => entries.filter((e) => e.plantId === plant?.id),
    [entries, plant?.id]
  );

  if (!plant) {
    return (
      <div>
        <h1 className="serif text-4xl text-forest">Plant not found</h1>
        <Link href="/plants" className="mt-4 inline-block text-sm text-mute underline">
          Back to collection
        </Link>
      </div>
    );
  }

  const hero = plant.photoIds[0] ? photoUrls[plant.photoIds[0]] : "";

  return (
    <div>
      <Link href="/plants" className="text-sm text-mute">
        ← Collection
      </Link>
      <div className="mt-4 overflow-hidden rounded-[28px] bg-parchment">
        {hero ? <img src={hero} alt={plant.nickname} className="h-72 w-full object-cover" /> : <div className="h-40 bg-sage" />}
        <div className="p-6">
          <p className="label">{plant.condition.replace("_", " ")}</p>
          <h1 className="serif text-4xl text-forest">{plant.nickname}</h1>
          <p className="mt-1 text-mute">
            {plant.commonName}
            {plant.scientificName ? ` · ${plant.scientificName}` : ""}
            {plant.confidence ? ` · ${Math.round(plant.confidence * 100)}%` : ""}
          </p>
          <p className="mt-2 text-sm">{roomName(plant.roomId)} · {plant.lightLevel} light</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Button onClick={() => void logWater(plant.id)}>Log water</Button>
        <Button tone="line" onClick={() => void snooze(plant.id)}>Snooze 1 day</Button>
        <Button tone="ghost" onClick={() => void skipWater(plant.id)}>Skip</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button tone="line" onClick={() => void logFeed(plant.id)}>Log feed</Button>
        <Button tone="line" onClick={() => void addMilestone(plant.id, "New leaf")}>New leaf</Button>
      </div>

      <section className="mt-10">
        <p className="label">Care rhythm</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Fact label="Next soil check" value={dueLabel(plant.nextWateringAt)} />
          <Fact label="Interval" value={`Every ${plant.carePlan.waterDays} days`} />
          <Fact label="Light" value={plant.carePlan.light} />
          <Fact label="Feed" value={plant.carePlan.feed} />
          <Fact label="Humidity" value={plant.carePlan.humidity} />
          <Fact label="Pets" value={plant.petToxicity} />
        </div>
        <p className="mt-4 text-sm text-mute">{plant.carePlan.notes}</p>
      </section>

      <section className="mt-10">
        <p className="label">Photo timeline</p>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {plant.photoIds.length === 0 ? (
            <p className="text-sm text-mute">No photos yet. Add one from the journal.</p>
          ) : (
            plant.photoIds.map((id) =>
              photoUrls[id] ? (
                <img key={id} src={photoUrls[id]} alt={`${plant.nickname} over time`} className="h-28 w-28 shrink-0 rounded-2xl object-cover" />
              ) : null
            )
          )}
        </div>
      </section>

      <section className="mt-10">
        <p className="label">Milestones</p>
        {plant.milestones.length === 0 ? (
          <p className="mt-2 text-sm text-mute">No milestones yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {plant.milestones.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-medium text-forest">{m.label}</span>
                <span className="text-mute"> · {formatShortDate(m.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <p className="label">Journal</p>
        {journal.length === 0 ? (
          <p className="mt-2 text-sm text-mute">Nothing written for this plant yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {journal.map((e) => (
              <li key={e.id} className="rounded-[18px] bg-parchment px-4 py-3">
                <p className="text-sm font-medium text-forest">{e.title}</p>
                <p className="text-xs text-mute">{formatShortDate(e.createdAt)} · {e.type}</p>
                {e.body ? <p className="mt-1 text-sm">{e.body}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 border-t border-forest/10 pt-6">
        {confirm ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">Remove {plant.nickname} from this device?</p>
            <Button
              tone="clay"
              onClick={async () => {
                await deletePlant(plant.id);
                setLoc("/plants");
              }}
            >
              Confirm delete
            </Button>
            <Button tone="ghost" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <button className="text-sm text-mute underline" onClick={() => setConfirm(true)}>
            Remove plant
          </button>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-parchment p-4">
      <p className="label">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
