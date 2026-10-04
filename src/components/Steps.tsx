/** Horizontal progress steps (checkout, order status). */
export function Steps({ steps, current, label }: { steps: string[]; current: number; label: string }) {
  return (
    <ol aria-label={label} className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-wider">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="flex items-center gap-3" aria-current={active ? "step" : undefined}>
            <span className={`flex items-center gap-2 ${active ? "text-ink" : done ? "text-success" : "text-muted"}`}>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[0.7rem] ${
                  active ? "border-ink bg-ink text-white" : done ? "border-success bg-success text-white" : "border-[#c9c4bd]"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {step}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-[#c9c4bd] sm:w-10" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
