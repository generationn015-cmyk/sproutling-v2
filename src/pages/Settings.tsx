import { useState } from "react";
import { Button, Field, Label, Sheet, Switch } from "../components/ui";
import { useApp } from "../hooks/useApp";

export function SettingsPage() {
  const { user, saveUser, enableReminders, disableReminders, pairing, createPairing, exportData, deleteAll } = useApp();
  const [privacy, setPrivacy] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const expired = pairing ? new Date(pairing.expiresAt).getTime() < Date.now() : true;

  return (
    <div className="max-w-xl">
      <p className="label">Preferences</p>
      <h1 className="serif mt-1 text-4xl text-forest">Settings</h1>

      <section className="mt-8 rounded-[24px] bg-parchment p-5">
        <Label>Your name</Label>
        <Field
          value={user.displayName}
          placeholder="Used in the Today greeting"
          onChange={(e) => void saveUser({ displayName: e.target.value })}
        />
        <p className="mt-2 text-xs text-mute">Greeting follows morning / afternoon / evening on this device.</p>
      </section>

      <section className="mt-4 rounded-[24px] bg-parchment p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-forest">Gentle reminders</p>
            <p className="mt-1 text-sm text-mute">
              {user.notificationPermission === "unsupported"
                ? "This browser cannot send notifications."
                : user.notificationPermission === "denied"
                  ? "Notifications are blocked. Enable them in browser settings, then toggle again."
                  : user.reminderEnabled
                    ? "On. The bell only badges when something is actually due."
                    : "Off. Turn on to request notification permission."}
            </p>
          </div>
          <Switch
            label="Gentle reminders"
            checked={user.reminderEnabled}
            onChange={(on) => void (on ? enableReminders() : disableReminders())}
          />
        </div>
        <div className="mt-4">
          <Label>Reminder hour</Label>
          <input
            type="range"
            min={6}
            max={21}
            value={user.reminderHour}
            onChange={(e) => void saveUser({ reminderHour: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-sm text-mute">{user.reminderHour}:00 local time</p>
        </div>
      </section>

      <section className="mt-4 rounded-[24px] bg-parchment p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-forest">Quiet motion</p>
            <p className="mt-1 text-sm text-mute">Turns off transitions. Also honors prefers-reduced-motion.</p>
          </div>
          <Switch
            label="Quiet motion"
            checked={user.reducedMotion}
            onChange={(on) => void saveUser({ reducedMotion: on })}
          />
        </div>
      </section>

      <section className="mt-4 rounded-[24px] bg-parchment p-5">
        <Label>Units</Label>
        <div className="flex gap-2">
          {(["imperial", "metric"] as const).map((u) => (
            <button
              key={u}
              className={`rounded-full px-4 py-2 text-sm ${user.units === u ? "bg-forest text-parchment-2" : "bg-parchment-2"}`}
              onClick={() => void saveUser({ units: u })}
            >
              {u}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[24px] bg-parchment p-5">
        <p className="font-medium text-forest">Device pairing</p>
        <p className="mt-1 text-sm text-mute">
          Short-lived 6-digit code. It expires in 15 minutes and is not a standing secret for the whole collection.
        </p>
        {pairing && !expired ? (
          <p className="serif mt-3 text-4xl tracking-[0.3em] text-forest">{pairing.code}</p>
        ) : (
          <p className="mt-3 text-sm text-mute">No active code.</p>
        )}
        <Button className="mt-4" tone="line" onClick={() => void createPairing()}>
          Mint a 15-minute code
        </Button>
      </section>

      <section className="mt-4 rounded-[24px] bg-parchment p-5 space-y-3">
        <Button tone="line" onClick={() => setPrivacy(true)}>
          How local storage works
        </Button>
        <Button tone="line" onClick={() => void exportData()}>
          Export JSON
        </Button>
        <Button tone="ghost" onClick={() => setConfirmWipe(true)}>
          Delete all data
        </Button>
      </section>

      <Sheet open={privacy} title="Privacy on this device" onClose={() => setPrivacy(false)}>
        <div className="space-y-3 text-sm text-mute">
          <p>Plants, journal entries, and photos live in IndexedDB in this browser — not in localStorage, and not as base64 strings.</p>
          <p>Photos are compressed to about 1280px JPEG before they are stored so a handful of pictures will not blow the quota.</p>
          <p>There is no standing court code. Pairing uses a 6-digit code that expires. Export downloads a JSON file you control.</p>
          <p>A vision API can be added at POST /api/plant-vision/analyze. Until then, identification falls back to a species catalog so adding a plant never blocks.</p>
        </div>
      </Sheet>

      <Sheet open={confirmWipe} title="Delete everything?" onClose={() => setConfirmWipe(false)}>
        <p className="text-sm text-mute">This clears plants, photos, and journal entries on this device. It cannot be undone unless you have an export.</p>
        <div className="mt-4 flex gap-3">
          <Button
            tone="clay"
            onClick={async () => {
              await deleteAll();
              setConfirmWipe(false);
            }}
          >
            Delete all data
          </Button>
          <Button tone="line" onClick={() => setConfirmWipe(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
