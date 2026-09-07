import { FormEvent, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BrandMark } from "../components/Layout";
import { Button, Field, Label } from "../components/ui";
import { useApp } from "../hooks/useApp";

export function SignUpPage() {
  const { signUp, hasAccount } = useApp();
  const [, nav] = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await signUp({ displayName, email, password, remember });
      nav("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      kicker="New account"
      title="Create your Sproutling."
      footer={
        hasAccount ? (
          <Link href="/signin" className="text-sm text-forest underline-offset-2 hover:underline">
            This device already has an account — sign in
          </Link>
        ) : (
          <Link href="/signin" className="text-sm text-mute">
            Already have an account? <span className="text-forest">Sign in</span>
          </Link>
        )
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>Your name</Label>
          <Field autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Maya" required />
        </div>
        <div>
          <Label>Email</Label>
          <Field type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
        </div>
        <div>
          <Label>Password</Label>
          <Field type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
        </div>
        <div>
          <Label>Confirm password</Label>
          <Field type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
        </div>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#294b3d]" />
          Stay signed in on this iPhone
        </label>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <p className="text-xs leading-relaxed text-mute">
          Account lives on this device. Photos stay in IndexedDB. There is no cloud login yet — export if you change phones.
        </p>
        <Button className="h-12 w-full" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function SignInPage() {
  const { signIn, hasAccount } = useApp();
  const [, nav] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn({ email, password, remember });
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      kicker="Welcome back"
      title="Sign in to your garden."
      footer={
        hasAccount ? (
          <p className="text-sm text-mute">Use the email you created on this device.</p>
        ) : (
          <Link href="/signup" className="text-sm text-mute">
            No account yet? <span className="text-forest">Create one</span>
          </Link>
        )
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>Email</Label>
          <Field type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>Password</Label>
          <Field type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#294b3d]" />
          Stay signed in on this iPhone
        </label>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <Button className="h-12 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}

function AuthShell({
  kicker,
  title,
  footer,
  children,
}: {
  kicker: string;
  title: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="ios-screen min-h-dvh bg-parchment-2 text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link href="/" className="flex items-center gap-3 py-3 text-forest">
          <BrandMark />
          <span className="serif text-xl">sproutling</span>
        </Link>
        <p className="label mt-8">{kicker}</p>
        <h1 className="serif mt-2 text-4xl text-forest">{title}</h1>
        <div className="mt-8">{children}</div>
        <div className="mt-6">{footer}</div>
      </div>
    </div>
  );
}
