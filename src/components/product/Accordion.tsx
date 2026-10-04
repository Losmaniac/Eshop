import type { ReactNode } from "react";

export function AccordionItem({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="group border-b border-line" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium tracking-tight hover:text-rust-dark">
        {title}
        <span className="relative h-4 w-4 shrink-0" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform group-open:scale-y-0" />
        </span>
      </summary>
      <div className="pb-6 text-[0.9375rem] leading-relaxed text-[#3b3936]">{children}</div>
    </details>
  );
}
