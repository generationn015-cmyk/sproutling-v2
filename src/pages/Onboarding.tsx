import { useState } from "react";
import { useLocation } from "wouter";
import { BrandMark } from "../components/Layout";
import { Button, Field, Label, Switch } from "../components/ui";
import { useApp } from "../hooks/useApp";
import type { Units } from "../types";

export function OnboardingPage() {
  const { user, saveUser, completeOnboarding, enableReminders } = useApp();
  const [, nav] = useLocation();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user.displayName);
  const [units, setUnits] = useState<Units>(user.units);
  const [hour, setHour] = useState(user.reminderHour);
  const [busy, setBusy] = useState(false);

  async function finish() {
    setBusy(true);
    try {
      await completeOnboarding({ displayName: name.trim() || user.displayName, units, reminderHour: hour });
      nav("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ios-screen min-h-dvh bg-parchment-2">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 py-3">
          <BrandMark />
          <span className="serif text-xl text-forest">sproutling</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-forest" : "bg-forest/15"}`} />
          ))}
        </div>

        {step === 0 ? (
          <section className="mt-10">
            <p className="label">Greeting</p>
            <h1 className="serif mt-2 text-4xl text-forest">What should we call you?</h1>
            <p className="mt-3 text-sm text-mute">Today opens with morning / afternoon / evening plus this name.</p>
            <div className="mt-8">
              <Label>Name</Label>
              <Field value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
            </div>
            <Button className="mt-8 h-12 w-full" onClick={() => void saveUser({ displayName: name.trim() }).then(() => setStep(1))}>
              Continue
            </Button>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="mt-10">
            <p className="label">Care rhythm</p>
            <h1 className="serif mt-2 text-4xl text-forest">How should reminders feel?</h1>
            <div className="mt-8 rounded-[24px] bg-parchment p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-forest">Gentle reminders</p>
                  <p className="mt-1 text-sm text-mute">iOS will ask once. You can change this later.</p>
                </div>
                <Switch
                  label="Gentle reminders"
                  checked={user.reminderEnabled}
                  onChange={(on) => void (on ? enableReminders() : saveUser({ reminderEnabled: false }))}
                />
              </div>
              <div className="mt-5">
                <Label>Reminder hour</Label>
                <input type="range" min={6} max={21} value={hour} onChange={(e) => setHour(Number(e.target.value))} className="w-full" />
                <p className="text-sm text-mute">{hour}:00 local time</p>
              </div>
            </div>
            <div className="mt-4 rounded-[24px] bg-parchment p-5">
              <Label>Units</Label>
              <div className="flex gap-2">
                {(["imperial", "metric"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm ${units === u ? "bg-forest text-parchment-2" : "bg-parchment-2"}`}
                    onClick={() => setUnits(u)}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button tone="line" className="h-12 flex-1" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="h-12 flex-1" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mt-10">
            <p className="label">Home Screen</p>
            <h1 className="serif mt-2 text-4xl text-forest">Add it like an iPhone app.</h1>
            <ol className="mt-6 space-y-3 text-sm text-ink">
              <li className="rounded-[20px] bg-parchment p-4">1. Tap the Share button in Safari.</li>
              <li className="rounded-[20px] bg-parchment p-4">2. Choose Add to Home Screen.</li>
              <li className="rounded-[20px] bg-parchment p-4">3. Open Sproutling from your home screen — full screen, no browser chrome.</li>
            </ol>
            <p className="mt-4 text-xs text-mute">
              After install, the app checks for a new version whenever you open it and applies the update automatically.
            </p>
            <div className="mt-8 flex gap-3">
              <Button tone="line" className="h-12 flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="h-12 flex-1" disabled={busy} onClick={() => void finish()}>
                {busy ? "Opening…" : "Enter Sproutling"}
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
