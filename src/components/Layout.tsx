import { Camera, House, Leaf, BookOpen, Settings, Bell } from "./icons";
import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { duePlants, useApp } from "../hooks/useApp";
import { formatLongDate } from "../lib/time";
import { PlantCheckSheet } from "./PlantCheckSheet";
import { BellSheet } from "./BellSheet";
import { Button } from "./ui";

const NAV = [
  { href: "/", label: "Today", icon: House },
  { href: "/plants", label: "Plants", icon: Leaf },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { plants, toasts, ready } = useApp();
  const [checkOpen, setCheckOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const due = useMemo(() => duePlants(plants), [plants]);

  return (
    <div className="min-h-screen bg-parchment-2 text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col bg-forest text-parchment-2 lg:flex">
        <Link href="/" className="flex items-center gap-3 px-6 py-6">
          <BrandMark />
          <div>
            <p className="serif text-xl leading-none">sproutling</p>
            <p className="label mt-1 !text-gold">Plant companion</p>
          </div>
        </Link>
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`tap flex items-center gap-3 rounded-full px-4 text-sm ${active ? "bg-parchment/15" : "hover:bg-parchment/10"}`}
              >
                <item.icon size={18} />
                {item.label}
                {item.href === "/" && due.length > 0 ? <span className="ml-auto h-2 w-2 rounded-full bg-clay" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="m-4 rounded-[22px] bg-forest-2 p-4">
          <p className="label !text-gold">Collection</p>
          <p className="serif mt-2 text-lg">{ready ? `${plants.length} plant${plants.length === 1 ? "" : "s"}` : "…"}</p>
          <p className="mt-1 text-xs text-parchment/70">Local-first. Photos stay on this device until you export.</p>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-forest/10 bg-parchment-2/90 px-4 py-3 backdrop-blur">
          <p className="text-sm text-mute">{formatLongDate()}</p>
          <div className="flex items-center gap-2">
            <Button tone="line" className="hidden sm:inline-flex" onClick={() => setCheckOpen(true)}>
              <Camera size={16} /> Plant check
            </Button>
            <button
              className="tap relative grid place-items-center rounded-full border border-forest/15"
              onClick={() => setBellOpen(true)}
              aria-label={due.length ? `${due.length} plants due` : "No plants due"}
            >
              <Bell size={18} />
              {due.length > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-clay" /> : null}
            </button>
            <Link
              href="/plants/new"
              className="tap grid place-items-center rounded-full bg-clay text-parchment-2"
              aria-label="Add plant"
            >
              <Camera size={18} />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-forest/10 bg-parchment-2/95 px-2 py-2 backdrop-blur lg:hidden">
        {NAV.map((item) => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap flex flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-forest" : "text-mute"}`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <PlantCheckSheet open={checkOpen} onClose={() => setCheckOpen(false)} />
      <BellSheet open={bellOpen} onClose={() => setBellOpen(false)} />

      <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2 lg:bottom-8">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto rounded-full bg-forest px-5 py-3 text-center text-sm text-parchment-2 shadow-lg">
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrandMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#f2eee4" />
      <path d="M32 52c0-14 0-22 0-30" stroke="#294b3d" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 28c-8-2-14-8-16-16 10 1 16 8 16 16Z" fill="#315b47" />
      <path d="M32 30c8-3 14-10 15-18-9 2-14 10-15 18Z" fill="#d9e3c9" />
      <circle cx="32" cy="18" r="3.2" fill="#e7c78d" />
    </svg>
  );
}
