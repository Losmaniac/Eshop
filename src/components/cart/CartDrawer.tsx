"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { catalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { CartLines, useCartSubtotal } from "./CartLines";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { lines, drawerOpen, closeDrawer } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const subtotal = useCartSubtotal();

  // The native <dialog> gives us focus trapping, Esc to close and focus
  // return to the opening button for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      aria-labelledby="cart-drawer-title"
      onClose={closeDrawer}
      onClick={(event) => {
        if (event.target === dialogRef.current) closeDrawer(); // click on backdrop
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-drawer-title" className="text-xl">
            Košík{lines.length > 0 && <span className="ml-2 font-mono text-sm font-normal text-muted">({lines.reduce((s, l) => s + l.quantity, 0)})</span>}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-sm hover:text-rust-dark"
            aria-label="Zavřít košík"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start gap-4 px-5 py-8">
            <p className="text-muted">Košík je zatím prázdný.</p>
            <Link href="/obchod" className="btn btn-outline" onClick={closeDrawer}>
              Prohlédnout obchod
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <CartLines onNavigate={closeDrawer} compact />
              <Suggestion slugs={lines.map((l) => l.slug)} onNavigate={closeDrawer} />
            </div>
            <div className="border-t border-line px-5 py-5">
              <div className="mb-1 flex items-baseline justify-between">
                <span>Mezisoučet</span>
                <span className="text-lg font-medium tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-sm text-muted">Doprava se vypočítá v pokladně.</p>
              <div className="flex flex-col gap-2">
                <Link href="/pokladna" className="btn btn-primary w-full" onClick={closeDrawer}>
                  Pokračovat k objednávce
                </Link>
                <Link href="/kosik" className="btn btn-outline w-full" onClick={closeDrawer}>
                  Zobrazit košík
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

/** One product that goes well with the cart: fire pit ↔ grill plate, otherwise anything not in the cart. */
function Suggestion({ slugs, onNavigate }: { slugs: string[]; onNavigate: () => void }) {
  const pairs: Record<string, string> = { "skladaci-ohniste": "grilovaci-plat", "grilovaci-plat": "skladaci-ohniste" };
  const wanted = slugs.map((s) => pairs[s]).find((s) => s && !slugs.includes(s) && !slugs.includes("set-ohniste-a-plat"));
  const product =
    catalog.find((p) => p.slug === wanted) ?? catalog.find((p) => p.orderType === "cart" && !p.isBundle && !slugs.includes(p.slug));
  if (!product) return null;
  const price = Math.min(...product.variants.map((v) => v.price));
  return (
    <div className="my-5 rounded-md bg-paper-dark p-4">
      <p className="eyebrow">Hodí se k tomu</p>
      <Link href={`/obchod/${product.slug}`} onClick={onNavigate} className="mt-2 flex items-center justify-between gap-4 hover:text-rust-dark">
        <span className="font-medium">{product.name}</span>
        <span className="shrink-0 text-sm tabular-nums">od {formatPrice(price)} →</span>
      </Link>
    </div>
  );
}
