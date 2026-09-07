import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button, EmptyState, Field, Label, Sheet } from "../components/ui";
import { useApp } from "../hooks/useApp";
import { compressImage } from "../lib/compress";
import { formatShortDate } from "../lib/time";
import type { JournalType } from "../types";

export function JournalPage() {
  const { plants, entries, photoUrls, addEntry, addPhoto, deleteEntry, toast } = useApp();
  const [filter, setFilter] = useState("all");
  const [compose, setCompose] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.plantId === filter)),
    [entries, filter]
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Notes</p>
          <h1 className="serif mt-1 text-4xl text-forest">Journal</h1>
        </div>
        <Button onClick={() => setCompose(true)}>New entry</Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        {plants.map((p) => (
          <Chip key={p.id} active={filter === p.id} onClick={() => setFilter(p.id)}>
            {p.nickname}
          </Chip>
        ))}
      </div>

      <div className="mt-8">
        {entries.length === 0 ? (
          <EmptyState
            title="Nothing written yet"
            body={
              plants.length === 0
                ? "Add a plant first. The plant picker stays off until there is someone to attach a note to."
                : "Log a watering from Today, or write a short observation."
            }
          >
            {plants.length === 0 ? (
              <Link href="/plants/new">
                <Button tone="clay">Add a plant</Button>
              </Link>
            ) : (
              <Button onClick={() => setCompose(true)}>New entry</Button>
            )}
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState title="No entries for that plant" body="Clear the chip to see the full timeline.">
            <Button tone="line" onClick={() => setFilter("all")}>
              Show all
            </Button>
          </EmptyState>
        ) : (
          <ol className="space-y-3">
            {visible.map((e) => {
              const plant = plants.find((p) => p.id === e.plantId);
              return (
                <li key={e.id} className="rounded-[22px] bg-parchment p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-forest">{e.title}</p>
                      <p className="text-xs text-mute">
                        {formatShortDate(e.createdAt)}
                        {plant ? ` · ${plant.nickname}` : ""} · {e.type}
                      </p>
                      {e.body ? <p className="mt-2 text-sm">{e.body}</p> : null}
                    </div>
                    <button className="text-xs text-mute underline" onClick={() => setPendingDelete(e.id)}>
                      Delete
                    </button>
                  </div>
                  {e.photoId && photoUrls[e.photoId] ? (
                    <img src={photoUrls[e.photoId]} alt="" className="mt-3 max-h-56 rounded-2xl object-cover" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <Compose open={compose} onClose={() => setCompose(false)} />

      <Sheet open={Boolean(pendingDelete)} title="Delete this entry?" onClose={() => setPendingDelete(null)}>
        <p className="text-sm text-mute">This only removes the note on this device.</p>
        <div className="mt-4 flex gap-3">
          <Button
            tone="clay"
            onClick={async () => {
              if (pendingDelete) await deleteEntry(pendingDelete);
              setPendingDelete(null);
            }}
          >
            Delete
          </Button>
          <Button tone="line" onClick={() => setPendingDelete(null)}>
            Keep it
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm ${active ? "bg-forest text-parchment-2" : "bg-parchment text-forest"}`}
    >
      {children}
    </button>
  );
}

function Compose({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { plants, addEntry, addPhoto, toast } = useApp();
  const [plantId, setPlantId] = useState(plants[0]?.id ?? "");
  const [type, setType] = useState<JournalType>("observe");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photoId, setPhotoId] = useState<string | undefined>();

  return (
    <Sheet open={open} title="New entry" onClose={onClose}>
      {plants.length === 0 ? (
        <p className="text-sm text-mute">Add a plant before attaching a journal entry.</p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim()) {
              toast("Give the note a short title");
              return;
            }
            await addEntry({ plantId: plantId || null, type, title: title.trim(), body: body.trim(), mood: "", photoId });
            toast("Entry saved");
            setTitle("");
            setBody("");
            setPhotoId(undefined);
            onClose();
          }}
        >
          <div>
            <Label>Plant</Label>
            <select
              className="tap w-full rounded-full border border-forest/15 bg-parchment-2 px-4 text-sm"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nickname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Type</Label>
            <select
              className="tap w-full rounded-full border border-forest/15 bg-parchment-2 px-4 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as JournalType)}
            >
              {["observe", "water", "feed", "repot", "photo", "milestone"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Title</Label>
            <Field value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New leaf on the north side" />
          </div>
          <div>
            <Label>Note</Label>
            <textarea
              className="min-h-24 w-full rounded-[22px] border border-forest/15 bg-parchment-2 p-4 text-sm outline-none"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <label className="text-sm text-mute">
            Photo optional
            <input
              type="file"
              accept="image/*"
              className="mt-2 block"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const blob = await compressImage(file);
                setPhotoId(await addPhoto(blob));
              }}
            />
          </label>
          <Button type="submit">Save entry</Button>
        </form>
      )}
    </Sheet>
  );
}
