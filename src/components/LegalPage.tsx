import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="text-display-sm md:text-display">{title}</h1>
      <div className="prose-page mt-8">{children}</div>
    </div>
  );
}

/** Marks text that the owner still has to fill in (shown subtly on the page). */
export function Placeholder({ children }: { children: ReactNode }) {
  return <span className="rounded-sm bg-paper-dark px-1 text-muted">[{children}]</span>;
}
