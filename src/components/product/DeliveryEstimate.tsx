"use client";

import { useSyncExternalStore } from "react";
import { estimatedDispatch, formatDayMonth } from "@/lib/delivery";
import { formatWorkingDays } from "@/lib/format";

const subscribe = () => () => {};

/** Dispatch date computed in the browser, so the static site never shows a stale date. */
export function DeliveryEstimate({ leadTimeDays }: { leadTimeDays: number }) {
  const date = useSyncExternalStore(
    subscribe,
    () => formatDayMonth(estimatedDispatch(leadTimeDays)),
    () => null,
  );
  return (
    <div className="flex gap-3 rounded-md bg-paper-dark p-4 text-[0.9375rem]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-rust" aria-hidden="true">
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="7" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <p>
        Vyrobíme do {formatWorkingDays(leadTimeDays)} od zaplacení.
        {date && (
          <>
            {" "}
            Při objednávce dnes odesíláme přibližně <strong className="font-medium">{date}</strong>.
          </>
        )}
      </p>
    </div>
  );
}
