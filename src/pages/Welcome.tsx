import { Link } from "wouter";
import { BrandMark } from "../components/Layout";
import { useApp } from "../hooks/useApp";

export function WelcomePage() {
  const { hasAccount } = useApp();

  return (
    <div className="ios-screen flex min-h-dvh flex-col bg-forest text-parchment-2">
      <div className="flex flex-1 flex-col px-6 pb-8 pt-[max(3rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <BrandMark />
          <p className="serif text-xl leading-none">sproutling</p>
        </div>

        <div className="mt-auto max-w-md pb-6">
          <p className="label !text-gold">Plant companion</p>
          <h1 className="serif mt-3 text-[2.6rem] leading-[1.05] tracking-tight">
            Keep the plants you already live with.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-parchment/75">
            A photo, a room, a watering rhythm. Journal the small moments. Reminds you only when something is actually due.
          </p>
        </div>

        <div className="space-y-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {hasAccount ? (
            <>
              <Link href="/signin" className="tap flex h-12 items-center justify-center rounded-full bg-gold text-sm font-semibold text-forest">
                Sign in
              </Link>
              <p className="text-center text-xs text-parchment/60">This device already has an account.</p>
            </>
          ) : (
            <>
              <Link href="/signup" className="tap flex h-12 items-center justify-center rounded-full bg-gold text-sm font-semibold text-forest">
                Create account
              </Link>
              <Link href="/signin" className="tap flex h-12 items-center justify-center rounded-full border border-parchment/25 text-sm font-medium">
                I already have an account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
