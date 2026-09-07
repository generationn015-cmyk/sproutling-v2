import type { ReactNode } from "react";
export function Icon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
  );
}
export function House(props: { size?: number }) { return <Icon size={props.size}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10h14V10" /></Icon>; }
export function Leaf(props: { size?: number }) { return <Icon size={props.size}><path d="M5 19c8-1 14-8 14-16-8 0-15 6-16 14Z" /><path d="M8 16c2-3 5-6 9-8" /></Icon>; }
export function BookOpen(props: { size?: number }) { return <Icon size={props.size}><path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2" /><path d="M12 6c2-1.5 5-2 8-2v14c-3 0-6 .5-8 2" /></Icon>; }
export function Settings(props: { size?: number }) { return <Icon size={props.size}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M4.9 6.5l1.6 1.2M17.5 16.3l1.6 1.2M3 12h2M19 12h2M4.9 17.5l1.6-1.2M17.5 7.7l1.6-1.2" /></Icon>; }
export function Bell(props: { size?: number }) { return <Icon size={props.size}><path d="M6 9a6 6 0 1 1 12 0c0 7 2 8 2 8H4s2-1 2-8" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>; }
export function Camera(props: { size?: number }) { return <Icon size={props.size}><path d="M4 8h3l2-2h6l2 2h3v12H4V8Z" /><circle cx="12" cy="13" r="3.5" /></Icon>; }
