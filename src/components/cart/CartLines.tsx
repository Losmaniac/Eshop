"use client";

import Image from "next/image";
import Link from "next/link";
import { getVariant } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { MAX_QUANTITY } from "@/lib/pricing";
import { asset } from "@/lib/site";
import { useCart } from "./CartProvider";

export function useCartSubtotal() {
  const { lines } = useCart();
  return lines.reduce((sum, line) => {
    const found = getVariant(line.slug, line.variantId);
    if (!found) return sum;
    const extra = line.personalization && found.product.personalization ? found.product.personalization.price : 0;
    return sum + (found.variant.price + extra) * line.quantity;
  }, 0);
}

export function CartLines({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { lines, setQuantity, remove } = useCart();

  return (
    <ul className="divide-y divide-line border-y border-line">
      {lines.map((line, index) => {
        const found = getVariant(line.slug, line.variantId);
        if (!found) return null;
        const { product, variant } = found;
        const extra = line.personalization && product.personalization ? product.personalization.price : 0;
        const image = product.images[0];
        return (
          <li key={`${line.slug}-${line.variantId}-${line.personalization ?? ""}`} className="flex gap-4 py-4">
            <Link
              href={`/obchod/${product.slug}`}
              onClick={onNavigate}
              className={`relative shrink-0 overflow-hidden rounded-sm bg-steel ${compact ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28"}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              {image && <Image src={asset(image.src)} alt="" fill sizes="112px" className="object-cover" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/obchod/${product.slug}`}
                    onClick={onNavigate}
                    className="font-medium leading-snug hover:text-rust-dark"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted">{variant.label}</p>
                  {line.personalization && (
                    <p className="text-sm text-muted">
                      Text: „{line.personalization}“
                      {extra > 0 && ` (+${formatPrice(extra)})`}
                    </p>
                  )}
                </div>
                <p className="shrink-0 font-medium tabular-nums">
                  {formatPrice((variant.price + extra) * line.quantity)}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center rounded-sm border border-line" role="group" aria-label={`Množství: ${product.name}`}>
                  <button
                    type="button"
                    className="h-9 w-9 text-lg hover:text-rust-dark disabled:opacity-40"
                    onClick={() => setQuantity(index, line.quantity - 1)}
                    disabled={line.quantity <= 1}
                    aria-label="Snížit množství"
                  >
                    −
                  </button>
                  <span className="w-8 text-center tabular-nums" aria-live="polite">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    className="h-9 w-9 text-lg hover:text-rust-dark disabled:opacity-40"
                    onClick={() => setQuantity(index, line.quantity + 1)}
                    disabled={line.quantity >= MAX_QUANTITY}
                    aria-label="Zvýšit množství"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-sm text-muted underline underline-offset-4 hover:text-rust-dark"
                  onClick={() => remove(index)}
                >
                  Odebrat<span className="sr-only"> {product.name}</span>
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
