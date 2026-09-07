import { Camera, House, Leaf, BookOpen, Settings, Bell } from "./icons";
import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { duePlants, useApp } from "../hooks/useApp";
import { initials } from "../lib/auth";
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
  const { plants, toasts, ready, user } = useApp();
  const [checkOpen, setCheckOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const due = useMemo(() => duePlants(plants), [plants]);

  return (
    <div className="ios-screen min-h-dvh bg-parchment-2 text-ink">
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
          <p className="label !text-gold">{user.displayName || "Signed in"}</p>
          <p className="serif mt-2 text-lg">{ready ? `${plants.length} plant${plants.length === 1 ? "" : "s"}` : "…"}</p>
          <p className="mt-1 text-xs text-parchment/70">{user.email || "Local account on this device"}</p>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-forest/10 bg-parchment-2/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
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
            <Link href="/plants/new" className="tap grid place-items-center rounded-full bg-clay text-parchment-2" aria-label="Add plant">
              <Camera size={18} />
            </Link>
            <Link href="/settings" className="tap grid h-11 w-11 place-items-center rounded-full bg-sage text-xs font-semibold text-forest" aria-label="Account">
              {initials(user.displayName, user.email)}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-forest/10 bg-parchment-2/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        {NAV.map((item) => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`tap flex flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-forest" : "text-mute"}`}>
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
      <text x="10" y="48" fontFamily="Georgia, serif" fontSize="36" fontWeight="600" fill="#294b3d">
        K
      </text>
      <path d="M40 48c1-9 5-16 9-21" fill="none" stroke="#315b47" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M49 29c-4-1-7-4-8-8 5 1 8 5 8 8Z" fill="#315b47" />
      <path d="M49 31c4-2 6-6 7-10-4 1-7 6-7 10Z" fill="#d9e3c9" />
      <circle cx="50" cy="19" r="2.3" fill="#e7c78d" />
    </svg>
  );
}
