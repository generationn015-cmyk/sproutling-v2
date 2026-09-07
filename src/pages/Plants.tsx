import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button, EmptyState, Field } from "../components/ui";
import { useApp } from "../hooks/useApp";
import { careStatus } from "../lib/care";
import { dueLabel } from "../lib/time";

export function PlantsPage() {
  const { plants, rooms, photoUrls, roomName } = useApp();
  const [q, setQ] = useState("");
  const [room, setRoom] = useState("all");
  const [due, setDue] = useState("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return plants.filter((p) => {
      const hay = `${p.nickname} ${p.commonName} ${p.scientificName}`.toLowerCase();
      if (query && !hay.includes(query)) return false;
      if (room !== "all" && p.roomId !== room) return false;
      if (due === "due") {
        const s = careStatus(p);
        if (s !== "due" && s !== "overdue") return false;
      }
      return true;
    });
  }, [plants, q, room, due]);

  const emptyCollection = plants.length === 0;
  const searchMiss = !emptyCollection && filtered.length === 0 && q.trim().length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Collection</p>
          <h1 className="serif mt-1 text-4xl text-forest">My plants</h1>
          <p className="mt-2 text-sm text-mute">
            {emptyCollection
              ? "No plants yet. Add the first one."
              : `${plants.length} plant${plants.length === 1 ? "" : "s"} · search and filter without losing the empty-state truth.`}
          </p>
        </div>
        <Link href="/plants/new">
          <Button tone="clay">+ Add plant</Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Field placeholder="Find a plant" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select
          className="tap rounded-full border border-forest/15 bg-parchment-2 px-4 text-sm"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        >
          <option value="all">All rooms</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          className="tap rounded-full border border-forest/15 bg-parchment-2 px-4 text-sm"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        >
          <option value="all">Any status</option>
          <option value="due">Due or overdue</option>
        </select>
      </div>

      <div className="mt-8">
        {emptyCollection ? (
          <EmptyState title="No plants yet" body="Add the first plant from a photo or enter a name yourself.">
            <Link href="/plants/new">
              <Button tone="clay">Identify from a photo</Button>
            </Link>
            <Link href="/plants/new?manual=1">
              <Button tone="line">Add manually</Button>
            </Link>
          </EmptyState>
        ) : searchMiss ? (
          <EmptyState title="No plant by that name" body="Try a nickname, or add someone new.">
            <Link href="/plants/new">
              <Button tone="line">Add a plant</Button>
            </Link>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing matches those filters" body="Clear a room or due filter to see the rest of the collection." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => (
              <li key={p.id}>
                <Link href={`/plants/${p.id}`} className="block overflow-hidden rounded-[24px] bg-parchment">
                  {p.photoIds[0] && photoUrls[p.photoIds[0]] ? (
                    <img src={photoUrls[p.photoIds[0]]} alt={p.nickname} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="grid h-44 place-items-center bg-sage text-forest">No photo yet</div>
                  )}
                  <div className="p-4">
                    <p className="serif text-2xl text-forest">{p.nickname}</p>
                    <p className="text-sm text-mute">
                      {p.commonName}
                      {p.scientificName ? ` · ${p.scientificName}` : ""}
                    </p>
                    <p className="mt-2 text-sm">
                      {roomName(p.roomId)} · Next soil check {dueLabel(p.nextWateringAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
