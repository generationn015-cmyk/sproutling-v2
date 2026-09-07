import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return <p className="label mb-2">{children}</p>;
}

export function Button({
  tone = "forest",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "forest" | "clay" | "ghost" | "line" }) {
  const tones = {
    forest: "bg-forest text-parchment-2 hover:bg-forest-2",
    clay: "bg-clay text-parchment-2 hover:opacity-90",
    ghost: "bg-transparent text-forest hover:bg-sage/50",
    line: "bg-transparent text-forest border border-forest/20 hover:border-forest/40",
  };
  return (
    <button
      className={`tap inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition ${tones[tone]} disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`tap w-full rounded-full border border-forest/15 bg-parchment-2 px-4 text-sm text-ink outline-none focus:border-forest/40 ${className}`}
      {...props}
    />
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-forest" : "bg-forest/20"}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-parchment-2 transition`}
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-forest/20 bg-parchment/60 px-8 py-16 text-center">
      <p className="serif text-2xl text-forest">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-mute">{body}</p>
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="sheet-backdrop absolute inset-0" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[86vh] w-full max-w-lg overflow-auto rounded-t-[28px] bg-parchment-2 p-6 shadow-xl sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="serif text-2xl text-forest">{title}</h2>
          <button className="tap rounded-full px-3 text-sm text-mute" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
