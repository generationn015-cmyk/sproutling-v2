import { Link } from "wouter";
import { Button, EmptyState } from "../components/ui";
import { useApp } from "../hooks/useApp";
import { queueForToday } from "../lib/care";
import { dueLabel, greeting } from "../lib/time";

export function TodayPage() {
  const { plants, user, photoUrls, logWater, snooze, skipWater, roomName } = useApp();
  const { overdue, due, upcoming } = queueForToday(plants);
  const firstName = user.displayName || "there";

  return (
    <div>
      <p className="label">Today</p>
      <h1 className="serif mt-2 max-w-2xl text-4xl text-forest md:text-5xl">{greeting(firstName)}.</h1>
      <p className="mt-3 max-w-xl text-mute">
        {plants.length === 0
          ? "Start with a photo of a plant you already live with."
          : overdue.length + due.length === 0
            ? "No soil checks today. Glance at the week ahead if you want."
            : "Due plants first. One tap logs water and writes a journal line."}
      </p>

      {plants.length === 0 ? (
        <div className="mt-8 overflow-hidden rounded-[28px] bg-forest px-8 py-10 text-parchment-2">
          <h2 className="serif text-4xl leading-tight">
            Your collection starts
            <span className="italic text-gold"> with one photo.</span>
          </h2>
          <p className="mt-4 max-w-lg text-sm text-parchment/80">
            Identify a plant, set the room and light, then get a watering interval you can actually use.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/plants/new" className="tap inline-flex items-center rounded-full bg-gold px-5 text-sm font-medium text-forest">
              Identify from a photo
            </Link>
            <Link href="/plants/new?manual=1" className="tap inline-flex items-center rounded-full border border-parchment/30 px-5 text-sm">
              Add details manually
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <Queue title="Overdue" items={overdue} photoUrls={photoUrls} roomName={roomName} onWater={logWater} onSnooze={snooze} onSkip={skipWater} />
          <Queue title="Due today" items={due} photoUrls={photoUrls} roomName={roomName} onWater={logWater} onSnooze={snooze} onSkip={skipWater} />
          <section>
            <p className="label">Next 7 days</p>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-mute">Nothing else this week.</p>
            ) : (
              <ul className="mt-3 divide-y divide-forest/10 rounded-[24px] bg-parchment">
                {upcoming.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <Link href={`/plants/${p.id}`} className="min-w-0">
                      <p className="truncate font-medium text-forest">{p.nickname}</p>
                      <p className="text-xs text-mute">{roomName(p.roomId)} · {p.carePlan.waterText}</p>
                    </Link>
                    <span className="shrink-0 text-sm text-mute">{dueLabel(p.nextWateringAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Queue({
  title,
  items,
  photoUrls,
  roomName,
  onWater,
  onSnooze,
  onSkip,
}: {
  title: string;
  items: import("../types").Plant[];
  photoUrls: Record<string, string>;
  roomName: (id: string) => string;
  onWater: (id: string) => Promise<void>;
  onSnooze: (id: string) => Promise<void>;
  onSkip: (id: string) => Promise<void>;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <p className="label">{title}</p>
      <ul className="mt-3 space-y-3">
        {items.map((p) => (
          <li key={p.id} className="rounded-[24px] bg-parchment p-4">
            <div className="flex gap-4">
              {p.photoIds[0] && photoUrls[p.photoIds[0]] ? (
                <img src={photoUrls[p.photoIds[0]]} alt={p.nickname} className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-sage text-forest">{p.nickname[0]}</div>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/plants/${p.id}`} className="serif text-2xl text-forest">
                  {p.nickname}
                </Link>
                <p className="text-sm text-mute">
                  {p.commonName} · {roomName(p.roomId)} · {dueLabel(p.nextWateringAt)}
                </p>
                <p className="mt-1 text-sm text-ink/80">Looks thirsty — check the top inch.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button className="h-10" onClick={() => void onWater(p.id)}>
                    Log water
                  </Button>
                  <Button tone="line" className="h-10" onClick={() => void onSnooze(p.id)}>
                    Snooze 1 day
                  </Button>
                  <Button tone="ghost" className="h-10" onClick={() => void onSkip(p.id)}>
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TodayEmptyHint() {
  return (
    <EmptyState title="No plants yet" body="Add the first plant from a photo or by name." />
  );
}
