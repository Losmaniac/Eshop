"use client";

import { useCart } from "./CartProvider";

export function CartButton() {
  const { count, loaded, openDrawer } = useCart();
  const label = loaded && count > 0 ? `Košík, ${count} ${count === 1 ? "položka" : count < 5 ? "položky" : "položek"}` : "Košík";

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative flex h-11 items-center gap-2 rounded-sm px-2 hover:text-rust-dark"
      aria-label={label}
      aria-haspopup="dialog"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 7h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 7Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="hidden text-sm font-medium sm:inline">Košík</span>
      {loaded && count > 0 && (
        <span className="absolute -right-1 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1 text-xs font-medium text-white sm:static">
          {count}
        </span>
      )}
    </button>
  );
}
